const S = {
  wrap: {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(30,29,34,0.48)',
    background: '#EFF8FE',
    borderBottom: '1px solid rgba(118,205,214,0.28)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 16px',
    borderBottom: '1px solid rgba(118,205,214,0.12)',
    verticalAlign: 'middle',
    color: '#1E1D22',
  },
  rowBase: {
    background: '#ffffff',
    transition: 'background 0.13s ease',
  },
  rowHover: {
    background: '#EFF8FE',
  },
}

export default function CRMDataTable({ columns, rows, rowKey }) {
  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={S.th}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isLast = i === rows.length - 1
            return (
              <tr
                key={rowKey(r)}
                style={S.rowBase}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, S.rowHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, S.rowBase)}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      ...S.td,
                      ...(isLast ? { borderBottom: 'none' } : {}),
                    }}
                  >
                    {typeof c.cell === 'function' ? c.cell(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}