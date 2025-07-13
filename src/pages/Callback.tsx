import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      navigate('/?error=auth_failed');
      return;
    }

    if (code) {
      // Send the code to backend to complete the OAuth flow
      fetch('/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            navigate('/?auth=success');
          } else {
            console.error('Auth failed:', data.error);
            navigate('/?error=auth_failed');
          }
        })
        .catch(error => {
          console.error('Error completing OAuth:', error);
          navigate('/?error=auth_failed');
        });
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-spotify p-8 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-spotify-green" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connecting to Spotify...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
};

export default Callback;
