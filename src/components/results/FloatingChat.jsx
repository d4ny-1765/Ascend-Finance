import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatInterface from "./ChatInterface";

export default function FloatingChat({ quizResponse }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center group"
            >
              <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            </Button>
            
            {/* Tooltip */}
            <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask AI Financial Advisor
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Chat Sidebar */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] lg:w-[500px] z-50 shadow-2xl"
            >
              <div className="h-full bg-white flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">AI Financial Advisor</h3>
                      <p className="text-xs text-indigo-100">Ask me anything about your plan</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface quizResponse={quizResponse} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}