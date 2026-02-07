import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

function VapiAssistant() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const vapiRef = useRef(null);

  useEffect(() => {
    // Initialize Vapi
    const vapi = new Vapi('6fbcc6b2-c19e-4f0a-b3fb-dac4a5a4f377'); // Replace with your key
    vapiRef.current = vapi;

    // Event listeners
    vapi.on('call-start', () => {
      console.log('Call started');
      setIsCallActive(true);
    });

    vapi.on('call-end', () => {
      console.log('Call ended');
      setIsCallActive(false);
      setIsSpeaking(false);
    });

    vapi.on('speech-start', () => {
      console.log('Assistant started speaking');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startCall = async () => {
    try {
      await vapiRef.current.start({
        // Option 1: Use an existing assistant ID
        assistantId: '7e49f9c1-b56a-4892-8c1f-28de1bb0428c',
        
        // Option 2: OR create assistant inline
        // assistant: {
        //   name: 'SolidFlo Support Assistant',
        //   model: {
        //     provider: 'openai',
        //     model: 'gpt-4',
        //     messages: [
        //       {
        //         role: 'system',
        //         content: 'You are a helpful assistant for SolidFlo, an invoicing SaaS. Answer questions about our product, pricing, and features. Be concise and friendly.'
        //       }
        //     ]
        //   },
        //   voice: {
        //     provider: 'elevenlabs',
        //     voiceId: 'your-voice-id'
        //   },
        //   firstMessage: 'Hi! I\'m here to answer any questions about SolidFlo. How can I help you today?'
        // }
      });
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = () => {
    vapiRef.current.stop();
  };

  return (
    <div className="fixed bottom-16 right-6 z-50">
      {!isCallActive ? (
        <button
          onClick={startCall}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2"
        >
          <Phone className="w-6 h-6" />
          <span className="font-semibold">Ask a Question</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            {isSpeaking ? (
              <div className="flex gap-1">
                <div className="w-2 h-8 bg-orange-500 rounded animate-pulse"></div>
                <div className="w-2 h-6 bg-orange-400 rounded animate-pulse delay-75"></div>
                <div className="w-2 h-10 bg-orange-500 rounded animate-pulse delay-150"></div>
              </div>
            ) : (
              <Mic className="w-6 h-6 text-orange-500 animate-pulse" />
            )}
            <span className="font-semibold text-gray-700">
              {isSpeaking ? 'Speaking...' : 'Listening...'}
            </span>
          </div>
          
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-all hover:scale-110"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default VapiAssistant;