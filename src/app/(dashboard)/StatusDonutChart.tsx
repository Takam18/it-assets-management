'use client'

type StatusDonutChartProps = {
  inStock: number;
  assigned: number;
  inRepair: number;
}

export function StatusDonutChart({ inStock, assigned, inRepair }: StatusDonutChartProps) {
  const total = inStock + assigned + inRepair || 1;
  
  const pctInStock = (inStock / total) * 100;
  const pctAssigned = (assigned / total) * 100;
  const pctInRepair = (inRepair / total) * 100;
  
  const gradient = `conic-gradient(
    var(--accent-cyan) 0%, 
    var(--accent-cyan) ${pctInStock}%,
    var(--accent-amber) ${pctInStock}%,
    var(--accent-amber) ${pctInStock + pctAssigned}%,
    var(--accent-violet) ${pctInStock + pctAssigned}%,
    var(--accent-violet) 100%
  )`;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3rem' }}>
      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
        {/* The Conic Gradient Donut */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: gradient,
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Inner Cutout (The hole) */}
          <div style={{
            width: '106px',
            height: '106px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{inStock + assigned + inRepair}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>In Stock</span>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inStock}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Assigned</span>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{assigned}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-violet)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>In Repair</span>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inRepair}</span>
        </div>
      </div>
    </div>
  )
}
