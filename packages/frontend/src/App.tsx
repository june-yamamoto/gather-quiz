import { useState } from 'react'

function App() {
  const [response, setResponse] = useState<string>('');

  const createTournament = async () => {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'My Tournament', password: 'password' }),
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div>
      <h1>GatherQuiz</h1>
      <button onClick={createTournament}>Create Tournament</button>
      <pre>{response}</pre>
    </div>
  )
}

export default App
