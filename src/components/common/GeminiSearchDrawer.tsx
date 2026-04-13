// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { X, Search, Sparkles, ArrowRight, Loader2, ShoppingBag, Globe, ExternalLink } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { geminiService } from '../../services/geminiService';
// import { GenerateContentResponse } from '@google/genai';

// interface GeminiSearchDrawerProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface Message {
//   role: 'user' | 'model';
//   content: string;
//   groundingMetadata?: any;
// }

// const GeminiSearchDrawer: React.FC<GeminiSearchDrawerProps> = ({ isOpen, onClose }) => {
//   const [query, setQuery] = useState('');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSearch = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!query.trim() || isLoading) return;

//     const userMessage = query.trim();
//     setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
//     setQuery('');
//     setIsLoading(true);

//     try {
//       const response = await geminiService.chat(userMessage, messages);
//       const text = response.text || "I'm sorry, I couldn't process that request.";
      
//       // Check for function calls (searchProducts)
//       const functionCalls = response.functionCalls;
//       if (functionCalls && functionCalls.length > 0) {
//         const call = functionCalls[0];
//         if (call.name === 'searchProducts') {
//           const args = call.args as any;
//           // Construct search params
//           const params = new URLSearchParams();
//           if (args.query) params.set('q', args.query);
//           if (args.parentCategoryId) params.set('parentCategoryId', args.parentCategoryId);
//           if (args.categoryId) params.set('categoryId', args.categoryId);
//           if (args.minPrice) params.set('minPrice', args.minPrice.toString());
//           if (args.maxPrice) params.set('maxPrice', args.maxPrice.toString());
//           if (args.brand) params.set('brand', args.brand);
//           if (args.gender) params.set('gender', args.gender);
//           if (args.isNew) params.set('filter', 'new');
//           if (args.sortBy) params.set('sortBy', args.sortBy);

//           setMessages(prev => [...prev, { 
//             role: 'model', 
//             content: `I've found some products for you! Redirecting to the shop with your filters...` 
//           }]);
          
//           setTimeout(() => {
//             navigate(`/shop?${params.toString()}`);
//             onClose();
//           }, 1500);
//           return;
//         }
//       }

//       // Handle grounding metadata (Google Search)
//       const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

//       setMessages(prev => [...prev, { 
//         role: 'model', 
//         content: text,
//         groundingMetadata 
//       }]);
//     } catch (error) {
//       console.error("AI Search Error:", error);
//       setMessages(prev => [...prev, { role: 'model', content: "I encountered an error while searching. Please try again." }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[60]"
//           />
//           <motion.div
//             initial={{ x: '100%' }}
//             animate={{ x: 0 }}
//             exit={{ x: '100%' }}
//             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//             className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
//           >
//             <div className="p-6 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/30">
//               <div className="flex items-center space-x-2">
//                 <Sparkles className="text-brand-gold" size={20} />
//                 <h2 className="text-lg font-serif text-brand-dark">AI Fashion Assistant</h2>
//               </div>
//               <button onClick={onClose} className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors">
//                 <X size={20} className="text-brand-dark/40" />
//               </button>
//             </div>

//             <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
//               {messages.length === 0 && (
//                 <div className="text-center space-y-4 py-12">
//                   <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
//                     <Search className="text-brand-gold" size={32} />
//                   </div>
//                   <h3 className="text-xl font-serif text-brand-dark">How can I help you today?</h3>
//                   <p className="text-sm text-brand-dark/60">Try asking things like:</p>
//                   <div className="grid grid-cols-1 gap-2">
//                     {[
//                       "Show me red dresses under 5000",
//                       "What's trending in men's footwear?",
//                       "Find some luxury pret for a wedding",
//                       "Show me the latest arrivals from Sana Safinaz"
//                     ].map((suggestion, i) => (
//                       <button
//                         key={i}
//                         onClick={() => {
//                           setQuery(suggestion);
//                           // We can't call handleSearch directly because query state won't be updated yet
//                         }}
//                         className="text-xs text-left p-3 bg-brand-cream/50 hover:bg-brand-gold/10 rounded-xl transition-colors text-brand-dark/80 border border-brand-dark/5"
//                       >
//                         {suggestion}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {messages.map((msg, i) => (
//                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
//                     msg.role === 'user' 
//                       ? 'bg-brand-dark text-white rounded-tr-none' 
//                       : 'bg-brand-cream text-brand-dark rounded-tl-none border border-brand-dark/5'
//                   }`}>
//                     <p className="leading-relaxed">{msg.content}</p>
                    
//                     {msg.groundingMetadata?.groundingChunks && (
//                       <div className="mt-4 pt-4 border-t border-brand-dark/10 space-y-2">
//                         <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 flex items-center">
//                           <Globe size={10} className="mr-1" /> Sources
//                         </p>
//                         {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
//                           chunk.web && (
//                             <a 
//                               key={idx}
//                               href={chunk.web.uri}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-[10px] text-brand-gold hover:text-brand-dark transition-colors group"
//                             >
//                               <span className="truncate flex-1 mr-2">{chunk.web.title || chunk.web.uri}</span>
//                               <ExternalLink size={10} className="flex-shrink-0" />
//                             </a>
//                           )
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               {isLoading && (
//                 <div className="flex justify-start">
//                   <div className="bg-brand-cream p-4 rounded-2xl rounded-tl-none border border-brand-dark/5">
//                     <Loader2 className="animate-spin text-brand-gold" size={20} />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="p-6 border-t border-brand-dark/5 bg-white">
//               <form onSubmit={handleSearch} className="relative">
//                 <input
//                   type="text"
//                   placeholder="Ask about fashion or search products..."
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   className="w-full pl-6 pr-14 py-4 bg-brand-cream/30 border-none rounded-2xl focus:ring-2 focus:ring-brand-gold/20 text-sm"
//                 />
//                 <button
//                   type="submit"
//                   disabled={isLoading || !query.trim()}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-dark text-white rounded-xl hover:bg-brand-gold transition-colors disabled:opacity-50 disabled:hover:bg-brand-dark"
//                 >
//                   <ArrowRight size={20} />
//                 </button>
//               </form>
//               <p className="mt-4 text-[10px] text-center text-brand-dark/40 uppercase tracking-widest font-bold">
//                 Powered by Gemini AI Grounding
//               </p>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default GeminiSearchDrawer;
