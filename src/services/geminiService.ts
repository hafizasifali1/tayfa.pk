// import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";

// // Initialize the Gemini API
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// // Define the searchProducts tool
// const searchProductsTool: FunctionDeclaration = {
//   name: "searchProducts",
//   description: "Search for products in the catalog based on various criteria like category, price, brand, and natural language query.",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       query: { type: Type.STRING, description: "Natural language search query" },
//       parentCategoryId: { type: Type.STRING, description: "Parent category ID" },
//       categoryId: { type: Type.STRING, description: "Child category ID" },
//       minPrice: { type: Type.NUMBER, description: "Minimum price" },
//       maxPrice: { type: Type.NUMBER, description: "Maximum price" },
//       brand: { type: Type.STRING, description: "Brand name or ID" },
//       gender: { type: Type.STRING, enum: ["men", "women", "kids"], description: "Target gender" },
//       isNew: { type: Type.BOOLEAN, description: "Whether to search for new arrivals" },
//       isFeatured: { type: Type.BOOLEAN, description: "Whether to search for featured products" },
//       sortBy: { type: Type.STRING, enum: ["newest", "price-low", "price-high", "rating"], description: "Sort order" }
//     }
//   }
// };

// export const geminiService = {
//   async chat(message: string, history: any[] = []) {
//     try {
//       const chat = ai.chats.create({
//         model: "gemini-3-flash-preview",
//         config: {
//           systemInstruction: `You are a helpful fashion assistant for TAYFA, a premium fashion marketplace. 
//           You help users find products using the searchProducts tool. 
//           When a user asks for products, use the tool to find them. 
//           You can also answer general fashion questions using your knowledge or Google Search.
//           Always be polite, professional, and helpful.`,
//           tools: [
//             { googleSearch: {} },
//             { functionDeclarations: [searchProductsTool] }
//           ],
//           toolConfig: { includeServerSideToolInvocations: true }
//         },
//         history: history.map(h => ({
//           role: h.role,
//           parts: [{ text: h.content }]
//         }))
//       });

//       const response = await chat.sendMessage({ message });
//       return response;
//     } catch (error) {
//       console.error("Gemini Chat Error:", error);
//       throw error;
//     }
//   },

//   async generateSearchFilters(query: string) {
//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: `Translate this natural language product search query into structured filters: "${query}"`,
//         config: {
//           systemInstruction: "You are a search query parser. Extract filters for a fashion marketplace.",
//           responseMimeType: "application/json",
//           responseSchema: {
//             type: Type.OBJECT,
//             properties: {
//               query: { type: Type.STRING },
//               parentCategoryId: { type: Type.STRING },
//               categoryId: { type: Type.STRING },
//               minPrice: { type: Type.NUMBER },
//               maxPrice: { type: Type.NUMBER },
//               brand: { type: Type.STRING },
//               gender: { type: Type.STRING },
//               isNew: { type: Type.BOOLEAN },
//               isFeatured: { type: Type.BOOLEAN },
//               sortBy: { type: Type.STRING }
//             }
//           }
//         }
//       });

//       if (response.text) {
//         return JSON.parse(response.text);
//       }
//       return null;
//     } catch (error) {
//       console.error("Gemini Filter Generation Error:", error);
//       return null;
//     }
//   }
// };
