import React, { useEffect, useRef, useState, memo } from 'react'; // Import memo
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../slices/authSlice';

const JITSI_DOMAIN = 'meet.jit.si';

// Reusable Loading Spinner
const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
);

// Memoize the component to prevent re-renders if props haven't changed
const JitsiMeet = memo(({ roomName, displayName: propDisplayName, eventTitle }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const currentUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(Boolean(window.JitsiMeetExternalAPI)); // Track if script is loaded

  const displayName = currentUser?.name || propDisplayName || 'Attendee';

  // Effect to load the Jitsi External API script ONCE
  useEffect(() => {
    if (jitsiLoaded) {
        console.log("Jitsi script already loaded.");
        return; // Script already loaded
    }

    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    document.body.appendChild(script);
    console.log("Loading Jitsi script...");

    script.onload = () => {
        console.log("Jitsi script loaded successfully.");
        setJitsiLoaded(true); // Mark script as loaded
    };
    script.onerror = () => {
        console.error("Failed to load Jitsi Meet External API script.");
        setLoading(false); // Stop loading indicator on script load error
    };

    // Cleanup script tag if component unmounts before load
    return () => {
        const existingScript = document.querySelector(`script[src="https://${JITSI_DOMAIN}/external_api.js"]`);
        if (existingScript && !jitsiLoaded) { // Only remove if loading failed/was interrupted
            console.log("Cleaning up Jitsi script tag (before load).");
            // Be cautious removing scripts others might rely on, but okay here if isolated
            // document.body.removeChild(existingScript);
        }
    };
  }, [jitsiLoaded]); // Run only once based on jitsiLoaded state


  // Effect to initialize and clean up the Jitsi meeting instance
  useEffect(() => {
    // Wait until the script is loaded AND we have a room name and container
    if (!jitsiLoaded || !roomName || !jitsiContainerRef.current) {
      console.log("Jitsi init prerequisites not met:", { jitsiLoaded, roomName: !!roomName, container: !!jitsiContainerRef.current });
      // If roomName is missing after script load, stop loading
      if(jitsiLoaded && !roomName) setLoading(false);
      return;
    }

    // --- Initialize Jitsi ---
    const initializeJitsi = () => {
        // Check again inside function, though outer condition should prevent this
        if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) {
            console.error("Jitsi API or container ref not available during initialization attempt.");
            setLoading(false);
            return;
        }
        // Ensure container is empty before adding iframe
        jitsiContainerRef.current.innerHTML = '';
        setLoading(true); // Show loading just before init

        try {
            const options = {
              roomName: roomName,
              parentNode: jitsiContainerRef.current,
              width: '100%',
              height: '100%',
              configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
              },
              interfaceConfigOverwrite: {
                DEFAULT_BACKGROUND: '#333333', // Darker background
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                TOOLBAR_BUTTONS: [ // Simplified default toolbar
                    'microphone', 'camera', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat',
                    'settings', 'tileview', 'videobackgroundblur', 'mute-everyone',
                ],
                // Disable remote control features which might cause issues
                // DISABLE_REMOTE_CONTROL: true,
              },
              userInfo: {
                displayName: displayName,
                email: currentUser?.email || '',
              },
            };

            console.log(`Initializing Jitsi Meet for room: ${roomName}`);
            const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
            jitsiApiRef.current = api; // Store the API object

            // --- Event Listeners ---
            api.addEventListener('videoConferenceJoined', () => {
              console.log('Local user joined Jitsi conference');
              setLoading(false);
              api.executeCommand('setSubject', eventTitle || roomName);
            });
            api.addEventListener('videoConferenceLeft', () => {
              console.log('Local user left Jitsi conference');
              // API instance is already disposed in the cleanup, no need to call dispose here
            });
            api.addEventListener('readyToClose', () => {
                console.log('Jitsi Meet ready to close (hangup clicked)');
                // API instance is disposed in the cleanup
            });
            // Add other listeners if needed...

        } catch (error) {
            console.error('Failed to initialize Jitsi Meet:', error);
            setLoading(false);
        }
      };

    // --- Run Initialization ---
    initializeJitsi();

    // --- Cleanup Function ---
    // This runs when the component unmounts OR when dependencies change
    return () => {
      console.log(`Cleanup effect running for room: ${roomName}`);
      if (jitsiApiRef.current) {
        console.log("Disposing Jitsi Meet API instance.");
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      if (jitsiContainerRef.current) {
          // Ensure container is cleared on cleanup as well
          jitsiContainerRef.current.innerHTML = '';
      }
      setLoading(true); // Reset loading state for potential re-init
    };
  // Dependencies: Only re-run if the script is loaded OR roomName changes
  }, [jitsiLoaded, roomName, eventTitle, displayName, currentUser?.email]); // Added other relevant props/state


  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
          <LoadingSpinner />
          <p className="ml-4 text-white">Loading Video Conference...</p>
        </div>
      )}
      {/* Container where Jitsi iframe will be attached */}
      <div ref={jitsiContainerRef} className="w-full h-full">
          {/* Jitsi iframe will appear here */}
      </div>
    </div>
  );
}); // Wrap component with memo

export default JitsiMeet;