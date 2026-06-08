export function SummaryHeader() {
  return (
    <div className="mb-16 pt-12 pb-8 border-b border-slate-100 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
        Clear the Clutter
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed">
        Select a cleanup option below to move non-essential emails to your trash. 
        <strong> Once there, you can permanently delete them to reclaim your storage space.</strong> 
        Your important and starred messages will always be protected.
      </p>
    </div>
  );
}