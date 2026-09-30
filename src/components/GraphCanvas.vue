<template>
  <div ref="networkContainer" class="network-container"></div>
  <div v-if="editingBubble" class="edit-modal">
    <div class="edit-form">
      <label>Content:</label>
      <textarea v-model="editingBubble.content" class="content-textarea"></textarea>
      <label>Metadata:</label>
      <input type="text" v-model="editingBubble.metadata" class="metadata-input" />
      <div class="buttons">
        <button @click="saveEdit">Save</button>
        <button @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network'
export default {
  name: 'GraphCanvas',
  setup() {
    const nodes = new DataSet([]);
    const edges = new DataSet([]);
    const networkContainer = ref(null);
    let network = null;
    const editingBubble = ref(null);
    const createBubble = (x, y, role = 'user', content = '', metadata = 'max_token=256') => {
      const id = Date.now() + '-' + Math.floor(Math.random() * 1000);
      nodes.add({
        id, label: content, x, y, role, metadata,
        color: { background: role === 'user' ? '#c8e6c9' : '#bbdefb', border: '#555' },
        shape: 'box', widthConstraint: { maximum: 500 }
      });
      return id;
    };
    const deleteBubbleAndChildren = (id) => {
      edges.get({ filter: e => e.from === id }).forEach(e => {
        deleteBubbleAndChildren(e.to);
        edges.remove({ id: e.id });
      });
      nodes.remove({ id });
    };
    const parseMetadata = (str) => {
      let meta = {};
      if (str)
        str.split(' ').forEach(pair => {
          const [k, v] = pair.split('=');
          meta[k] = v;
        });
      return meta;
    };
    const triggerGeneration = async (bubbleId) => {
      const bubble = nodes.get(bubbleId);
      const parentEdges = edges.get({ filter: e => e.to === bubbleId });
      const messages = parentEdges.map(e => {
        const parent = nodes.get(e.from);
        return { role: parent.role, content: parent.label };
      });
      const meta = parseMetadata(bubble.metadata);
      const response = await fetch('http://localhost:8080/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true, ...meta })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let generatedText = bubble.label;
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        chunk.split('\n').forEach(line => {
          try {
            const data = JSON.parse(line.substring(6)).choices[0].delta.content;
            if (data) {
              generatedText += data;
              nodes.update({ id: bubbleId, label: generatedText });
            }
          } catch {
            //do nothing
          }
        });
      }
    };
    const saveEdit = () => {
      if (!editingBubble.value) return;
      const { id, content, metadata } = editingBubble.value;
      nodes.update({ id, label: content, metadata });
      editingBubble.value = null;
      if (content === "") triggerGeneration(id);
    };
    const cancelEdit = () => { editingBubble.value = null; };
    onMounted(() => {
      network = new Network(networkContainer.value, { nodes, edges }, {
        manipulation: false,
        physics: false,
        interaction: { multiselect: true, dragNodes: true, dragView: true, zoomView: true },
        edges: { arrows: { to: { enabled: true, type: 'arrow' } } }
      });
      network.on("doubleClick", params => {
        if (params.nodes.length) {
          const id = params.nodes[0];
          const bubble = nodes.get(id);
          editingBubble.value = { id, content: bubble.label, metadata: bubble.metadata };
        } else {
          const { x, y } = params.pointer.canvas;
          createBubble(x, y);
        }
      });
      let lastMouseUpPos = null, draggedNodesIds = [], draggedNodesInitialPositions = {};
      networkContainer.value.addEventListener("mouseup", e => {
        lastMouseUpPos = { clientX: e.clientX, clientY: e.clientY };
      });
      network.on("dragStart", params => {
        draggedNodesIds = [...params.nodes];
        draggedNodesInitialPositions = network.getPositions(draggedNodesIds);
      });
      network.on("dragEnd", () => {
        if (draggedNodesIds.length && lastMouseUpPos) {
          const targetId = network.getNodeAt({ x: lastMouseUpPos.clientX, y: lastMouseUpPos.clientY });
          if (targetId) {
            draggedNodesIds.forEach(draggedId => {
              const exists = edges.get({ filter: e => e.from === draggedId && e.to === targetId });
              if (!exists.length) {
                edges.add({ from: draggedId, to: targetId });
                const dragged = nodes.get(draggedId);
                const newRole = dragged.role === 'user' ? 'assistant' : 'user';
                nodes.update({ id: targetId, role: newRole, color: { background: newRole === 'user' ? '#c8e6c9' : '#bbdefb', border: '#555' } });
              }
              const initPos = draggedNodesInitialPositions[draggedId];
              if (initPos) network.moveNode(draggedId, initPos.x, initPos.y);
            });
          }
          draggedNodesIds = [];
          draggedNodesInitialPositions = {};
          lastMouseUpPos = null;
        }
      });
      document.addEventListener("keydown", e => {
        if (e.key === "Delete") {
          network.getSelectedNodes().forEach(id => deleteBubbleAndChildren(id));
          network.getSelectedEdges().forEach(id => edges.remove({ id }));
        }
      });
    });
    return { networkContainer, editingBubble, saveEdit, cancelEdit };
  }
}
</script>

<style scoped>
.network-container { width: 100%; height: 100%; background: #f5f5f5; cursor: grab; }
.edit-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.edit-form { background: #fff; padding: 20px; border-radius: 8px; min-width: 500px; }
.edit-form label { display: block; margin-top: 10px; }
.content-textarea { width: 100%; max-width: 200ch; height: 100px; }
.metadata-input { width: 100%; }
.buttons { margin-top: 15px; display: flex; justify-content: flex-end; }
.buttons button { margin-left: 10px; }
</style>
