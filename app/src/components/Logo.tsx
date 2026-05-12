export function Logo() {
  return (
    <div className="flex items-center">
      <div className="grid grid-cols-2 gap-[2px] mr-2">
        <div className="w-2 h-2 rounded-full bg-[#e74c3c]" />
        <div className="w-2 h-2 rounded-full bg-[#f1c40f]" />
        <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />
        <div className="w-2 h-2 rounded-full bg-[#3498db]" />
      </div>
      <span className="text-white text-xl font-bold tracking-tight">十年后</span>
    </div>
  );
}
