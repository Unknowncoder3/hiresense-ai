export function downloadCsv(filename, rows){
 if(!rows?.length) return false
 const headers=Object.keys(rows[0])
 const escape=value=>`"${String(value??'').replace(/"/g,'""')}"`
 const csv=[headers.map(escape).join(','),...rows.map(row=>headers.map(h=>escape(row[h])).join(','))].join('\n')
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
 const url=URL.createObjectURL(blob)
 const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
 return true
}
