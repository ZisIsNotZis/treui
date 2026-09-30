import axios from "axios";

export async function generateAIResponse(messages) {
  try {
    const response = await axios.post("http://localhost:8080/v1/chat/completions", {
      messages,
      stream: true,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating AI response.";
  }
}
