'use client';

import { useState } from 'react';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const INSTANT_ANSWERS = [
  'How to measure my nails',
  'How long does it take for my order to ship?',
  'What is your return policy?',
  'Do you do custom design?',
  'Track my order',
  'What is your contact info?',
];

const AI_RESPONSES: Record<string, string> = {
  'how to measure':
    'To measure your nails:\n\n1. Use a soft measuring tape or ruler\n2. Measure the widest part of each nail bed in millimeters\n3. Round up if between sizes\n4. Order Custom Size if you need precise measurements\n\nFor detailed instructions, check our Size Guide in the FAQ section.',
  'how long':
    "Shipping times vary by location:\n\n🇪🇺 EU: 7–14 business days\n🇬🇧 UK: 10–18 business days\n🇺🇸 USA/Canada: 12–20 business days\n🌍 Rest of World: 15–25 business days\n\nProcessing takes 3–5 business days as each set is handcrafted to order. You'll receive tracking once shipped!",
  return:
    "Our return policy:\n\n✓ 14-day returns for unopened items\n✓ Free size exchanges within 7 days\n✗ Custom orders are final sale\n\nContact support@lunelle.com to start a return. We'll provide a Return Authorization number within 24 hours.",
  custom:
    'Yes! We love creating custom designs. 💅\n\nCustom orders:\n• Start at €45\n• Take 7–10 business days\n• Include consultation with our designers\n• Are final sale (no returns)\n\nEmail support@lunelle.com with your design idea, preferred colors, and inspiration photos!',
  track:
    "To track your order:\n\n1. Visit our Order Tracking page\n2. Enter your Order ID\n3. Enter your phone number\n\nYou'll see real-time status updates. Your tracking number was also emailed when your order shipped.",
  contact:
    "We're here to help! 💌\n\n📧 Email: support@lunelle.com\n💬 Live Chat: Available on this page\n⏰ Hours: Mon-Fri, 9 AM – 6 PM CET\n\nTypical response time: Within 24 hours",
};

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleQuickAnswer = async (question: string) => {
    addMessage(question, 'user');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1000));

    const lowerQ = question.toLowerCase();
    let response =
      "I'm not sure about that. Please contact our support team at support@lunelle.com for personalized assistance.";

    for (const [keyword, answer] of Object.entries(AI_RESPONSES)) {
      if (lowerQ.includes(keyword)) {
        response = answer;
        break;
      }
    }

    setIsTyping(false);
    addMessage(response, 'ai');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input;
    setInput('');
    addMessage(userInput, 'user');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200));

    const lowerInput = userInput.toLowerCase();
    let response =
      'Thanks for your message! For detailed assistance, please contact support@lunelle.com or check our FAQ page.';

    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      response =
        'Our press-on nail sets range from €26 to €35. Some collections may have special pricing. Visit our Products page to see all current prices and any ongoing promotions!';
    } else if (lowerInput.includes('shipping') || lowerInput.includes('delivery')) {
      response = AI_RESPONSES['how long'];
    } else if (lowerInput.includes('size') || lowerInput.includes('measure')) {
      response = AI_RESPONSES['how to measure'];
    } else if (
      lowerInput.includes('return') ||
      lowerInput.includes('refund') ||
      lowerInput.includes('exchange')
    ) {
      response = AI_RESPONSES['return'];
    } else if (lowerInput.includes('custom') || lowerInput.includes('personali')) {
      response = AI_RESPONSES['custom'];
    } else if (lowerInput.includes('track') || lowerInput.includes('order status')) {
      response = AI_RESPONSES['track'];
    } else if (
      lowerInput.includes('contact') ||
      lowerInput.includes('email') ||
      lowerInput.includes('phone')
    ) {
      response = AI_RESPONSES['contact'];
    } else if (
      lowerInput.includes('hello') ||
      lowerInput.includes('hi') ||
      lowerInput.includes('hey')
    ) {
      response =
        "Hi there! 👋 Welcome to Silver14 Nail. I'm here to help you find the perfect press-on nails. What can I assist you with today?";
    }

    setIsTyping(false);
    addMessage(response, 'ai');
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 size-14 bg-[#1A1A1A] text-white rounded-full shadow-lg hover:bg-[#333] transition-colors flex items-center justify-center"
            aria-label="Open chat"
          >
            <MessageCircle className="size-6" />
            <span className="absolute -top-1 -right-1 size-3 bg-[#4A7A5A] rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-96 bg-white border border-[#E0E0E0] shadow-2xl flex flex-col"
            style={{ maxHeight: '600px', height: '80vh' }}
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Chat with us</h3>
                  <p className="text-xs text-white/70">We're happy to help!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Close chat"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]">
              {messages.length === 0 ? (
                <div>
                  <div className="bg-white p-4 shadow-sm mb-4">
                    <p className="text-sm text-[#1A1A1A] mb-3">
                      👋 Hi! Message us with any questions. We're happy to help!
                    </p>
                  </div>

                  <div className="mb-3">
                    <p
                      className="text-xs uppercase text-[#9A9A9A] mb-3"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      Instant answers
                    </p>
                    <div className="space-y-2">
                      {INSTANT_ANSWERS.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAnswer(q)}
                          className="w-full text-left bg-white hover:bg-[#F5F5F5] border border-[#E8E8E8] p-3 text-sm text-[#1A1A1A] transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                      <div className="bg-[#F5F5F5] border border-[#E8E8E8] p-3 text-sm text-[#5A5A5A]">
                        Please contact IG @silver14nail for quickest support
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 text-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-white text-[#1A1A1A] border border-[#E8E8E8]'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[#E8E8E8] p-3">
                        <div className="flex gap-1">
                          <span
                            className="size-2 bg-[#9A9A9A] rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="size-2 bg-[#9A9A9A] rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="size-2 bg-[#9A9A9A] rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#E8E8E8] bg-white flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write message"
                  className="flex-1 border border-[#E0E0E0] px-4 py-2.5 text-sm focus:outline-none focus:border-[#9A9A9A]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#1A1A1A] text-white px-4 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
