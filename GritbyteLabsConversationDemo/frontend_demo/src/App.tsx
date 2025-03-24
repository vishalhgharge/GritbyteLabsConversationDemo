import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";
import { Telephone, TelephoneX } from 'react-bootstrap-icons'; // Import the icons you want to use
import '@fontsource/raleway'; // Defaults to weight 400

const agentId = "agent_eeb239e8a9f85992b555bd3507";
const retellWebClient = new RetellWebClient();

const App = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isAI, setIsAI] = useState<boolean>(false); // Track if AI or User is speaking
  const [listening, setListening] = useState<boolean>(false); // Track if user is speaking

  const [hasAgentStarted, setHasAgentStarted] = useState(false);

  useEffect(() => {
    // Event listeners to start/stop AI speaking
    retellWebClient.on("agent_start_talking", () => {
      setHasAgentStarted(true);
      setIsAI(true); // AI starts speaking
      setListening(false); // Stop listening when AI speaks
    });

    retellWebClient.on("agent_stop_talking", () => {
      setIsAI(false); // AI stops speaking
      setListening(true); // Start listening for user
    });

    retellWebClient.on("user_start_talking", () => {
      setIsAI(false); // User starts speaking
      setListening(true); // Start listening when user speaks
    });

    retellWebClient.on("user_stop_talking", () => {
      setIsAI(true); // User stops speaking
      setListening(false); // Stop listening when user stops talking
    });
  }, []);

  const toggleConversation = async () => {
    if (isCalling) {
      retellWebClient.stopCall();
      setIsCalling(false); // End the call
      setIsAI(false);
      setListening(false);
    } else {
      const registerCallResponse = await registerCall(agentId);
      if (registerCallResponse.access_token) {
        retellWebClient
          .startCall({
            accessToken: registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true); // Start the call
        setIsAI(true);
        setListening(false); 
      }
    }
  };

  async function registerCall(agentId: string): Promise<{ access_token: string }> {
    try {
      const response = await fetch("http://gritbytedemo-env.eba-crqwszf6.us-east-1.elasticbeanstalk.com/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.log("Error in registerCall:", err);
      throw new Error(err);
    }
  }

  return (
    <div className="App">
      <h2 style={{ marginBottom: '50px', fontFamily: 'Raleway, sans-serif' }}>Gritbyte Labs Conversation Demo - English</h2>
      <header className="App-header">
        
        
        {/* Circle Animation with Audio Spectrum */}
        <div className="pulse-container">
          {/* Outer Circle Audio Spectrum */}
          <div className={`audio-spectrum ${isAI ? 'active' : ''}`}></div>

          {/* Pulse Animation Inside */}
          <div className={`pulse-animation ${isAI ? 'animate' : ''}`}>
            {/* Equalizer Animation */}
            {isAI && (
              <div className="equalizer">
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
                <div className="equalizer-bar"></div>
              </div>
            )}

            {/* Image inside the circle */}
            <img
              src="/images/latin-man-avatar-people-04feb2024__9_-ID32942-2000x2000-removebg-preview.png"
              alt="AI"
              className="circle-image"
            />
          </div>
        </div>

        {/* Show "Listening..." text when user speaks */}
        {hasAgentStarted && !isAI && listening && <p className="listening-text">Listening...</p>}

        {/* Start/Stop Button */}
        <button
          onClick={toggleConversation}
          className={`call-button ${isCalling ? "stop" : "start"}`}
        >
          {/* Conditionally render the icon */}
          {isCalling ? <TelephoneX size={40} /> : <Telephone size={40} />}
        </button>
      </header>
    </div>
  );
};

export default App;
