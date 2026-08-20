import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';

export function AssistantPage() {
  const [question, setQuestion] = useState('How much milk did we record today?');
  const [answer, setAnswer] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask(q: string) {
    setBusy(true);
    try {
      const { data } = await api.post('/ai/ask', { question: q });
      setAnswer(data.answer);
      setProvider(data.provider);
    } finally {
      setBusy(false);
    }
  }

  function listen() {
    const Speech = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition
      ?? (window as unknown as { SpeechRecognition?: new () => SpeechRec }).SpeechRecognition;
    if (!Speech) {
      setAnswer('Voice input is not available in this browser. Type your question instead.');
      return;
    }
    const rec = new Speech();
    rec.lang = 'en-US';
    rec.onresult = (ev: { results: { 0: { 0: { transcript: string } } } }) => {
      const text = ev.results[0][0].transcript;
      setQuestion(text);
      void ask(text);
    };
    rec.start();
  }

  return (
    <>
      <PageHeader title="AI assistant" subtitle="Local llama3 via Ollama. Numbers always come from PostgreSQL first." />
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Ask about this farm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              multiline
              minRows={2}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" disabled={busy} onClick={() => void ask(question)}>
                Ask llama3
              </Button>
              <Button startIcon={<MicIcon />} onClick={listen} aria-label="Voice question">
                Voice
              </Button>
            </Box>
            {provider ? <Typography variant="caption">Provider: {provider}</Typography> : null}
            {answer ? <Alert severity="success">{answer}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

type SpeechRec = {
  lang: string;
  start: () => void;
  onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
};
