/**
 * Converts an array of objects to a CSV file and triggers a download.
 */
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  ).join('\n');
  
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
