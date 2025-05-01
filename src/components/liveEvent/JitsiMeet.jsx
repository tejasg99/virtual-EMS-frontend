import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../slices/authSlice.js'

const JITSI_DOMAIN = 'https://meet.jit.si'; // jitsi public domain

function JitsiMeet({ roomName, displayName: propDisplayName, eventTitle }) {
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null); // to store the jitsi api object
    const currentUser = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(true);

    // logged-in user's name otherwise fallback to prop or default
    const displayName = currentUser?.name || propDisplayName || 'Attendee';

    useEffect(() => {
        // Ensure roomName is provided
        if(!roomName || !jitsiContainerRef.current) {
            console.warn('Jitsi Meet: Room name or container ref missing');
            setLoading(false);
            return;
        }

        // Check if the Jitsi External API script is already loaded
        if(!window.JitsiMeetExternalAPI) {
            const script = document.createElement('script');
            script.src = `${JITSI_DOMAIN}/external_api.js`;
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => initializeJitsi();
            script.onerror = () => {
                console.error('Failed to load Jitsi Meet External API script');
                setLoading(false);
            }
        } else {
            initializeJitsi();
        }

        // Cleanup function to dispose of Jitsi Meeting
        return () => {
            if(jitsiApiRef.current) {
                console.log('Disposing Jitsi Meet API instance');
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }

            // Clean up container
            if(jitsiContainerRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                jitsiContainerRef.current.innerHTML = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName]); // Re-initialize only if roomName changes

    const initializeJitsi = () => {
        if(!window.JitsiMeetExternalAPI) {
            console.error("Jitsi API not loaded yet.");
            setLoading(false);
            return;
        }

        // Dispose existing instance if any before creating a new one
        if(jitsiApiRef.current) {
            console.log("Disposing previous Jitsi instance before re-initializing.");
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }

        // Clear container before initializing
        if(jitsiContainerRef.current) {
            jitsiContainerRef.current.innerHTML = '';
        } else {
            console.error('Jitsi container ref is not available during initialization.');
            setLoading(false);
            return;
        }

        try {
            const options = {
                roomName: roomName,
                parentNode: jitsiContainerRef.current,
                width: '100%',
                height: '100%', // Adjust height as needed, maybe via parent container
                // Default config overrides
                configOverwrite: {
                  startWithAudioMuted: true,
                  startWithVideoMuted: true,
                  prejoinPageEnabled: false, // Skip the prejoin screen
                  // disableDeepLinking: true,
                  // You might want to disable some buttons for attendees
                  // toolbarButtons: [ 'microphone', 'camera', 'chat', 'tileview', 'fullscreen', 'hangup' ],
                },
                // Interface config overrides
                interfaceConfigOverwrite: {
                  // filmStripOnly: true, // Example: simpler interface
                  DEFAULT_BACKGROUND: '#474747',
                  SHOW_JITSI_WATERMARK: false,
                  SHOW_WATERMARK_FOR_GUESTS: false,
                  TOOLBAR_BUTTONS: [
                       'microphone', 'camera', 'desktop', 'fullscreen',
                       'fodeviceselection', 'hangup', 'profile', 'chat', // Keep chat button?
                       'settings', 'tileview', 'videobackgroundblur', 'mute-everyone',
                       // 'etherpad', 'sharedvideo', 'shareaudio', 'livestreaming', 'invite', 'participants',
                  ],
                },
                // User Info
                userInfo: {
                  displayName: displayName,
                  email: currentUser?.email || '', // Optional email
                },
                // JWT token (if using secure domain) - not applicable for meet.jit.si public
                // jwt: 'JWT_TOKEN',
            };

            console.log('Initializing Jitsi Meet with options: ', options);
            const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
            jitsiApiRef.current = api; // Store the api object

            //  Event listeners
            api.addEventListener('videoConferenceJoined', () => {
                console.log('Local user joined Jitsi conference');
                setLoading(false); // Stop loading indicator
                api.executeCommand('setSubject', eventTitle || roomName); // Set meeting title
            });
            api.addEventListener('videoConferenceLeft', () => {
                console.log('Local user left Jitsi conference');
                // Handle cleanup or navigation if needed
                jitsiApiRef.current?.dispose(); // Ensure disposal on leave
                jitsiApiRef.current = null;
            });
            // Add more listeners as needed: participantJoined, participantLeft, etc.
            api.addEventListener('readyToClose', () => {
                console.log('Jitsi Meet ready to close (hangup clicked)');
                jitsiApiRef.current?.dispose();
                jitsiApiRef.current = null;
                // Potentially navigate away or show a "meeting ended" message
            });
            api.addEventListener('participantJoined', (participant) => {
                console.log('Participant joined:', participant);
            });
            api.addEventListener('displayNameChange', (data) => {
                console.log(`Display name changed for ${data.id} to ${data.displayname}`);
            });
        } catch (error) {
            console.error('Failed to initialize Jitsi Meet:', error);
            setLoading(false);
        }
    }

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
  )
}

// Reusable Loading Spinner
const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
);

export default JitsiMeet