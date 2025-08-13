'use client';
import { useState } from 'react';

export default function PrototypePage() {
  const [step, setStep] = useState<'tenant' | 'pm' | 'contractor'>('tenant');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={() => setStep('tenant')} style={btn}>Tenant</button>
        <button onClick={() => setStep('pm')} style={btn}>Property Manager</button>
        <button onClick={() => setStep('contractor')} style={btn}>Contractor</button>
      </div>

      {step === 'tenant' && <Card title="Tenant Flow" body="Submit a repair with photos and preferred times."/>}
      {step === 'pm' && <Card title="PM Dashboard" body="Review SLAs, approve jobs, and track status in real time."/>}
      {step === 'contractor' && <Card title="Contractor App" body="Claim nearby jobs, chat, and get paid on completion."/>}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #DDD',
  background: '#FFF',
  cursor: 'pointer',
};

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: 14, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ marginBottom: 0 }}>{body}</p>
    </div>
  );
}
