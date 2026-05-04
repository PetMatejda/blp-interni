export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '60vh',
      gap: '1rem',
      color: 'var(--secondary)'
    }}>
      <div style={{ 
        padding: '2rem', 
        background: 'var(--card)', 
        borderRadius: 'var(--radius-xl)', 
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--foreground)', marginBottom: '0.5rem' }}>{title}</h2>
        <p>Tento modul je momentálně ve vývoji (Fáze 2/3).</p>
      </div>
    </div>
  );
}
