export default function TechStrip() {
  const techs = [
    {
      name: 'LangChain',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      name: 'LangGraph',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
    },
    {
      name: 'Firebase',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 17l6-13 3 6-3 7H4z" />
          <path d="M10 10l4-6 6 13h-7l-3-7z" />
        </svg>
      ),
    },
    {
      name: 'Google Cloud',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      ),
    },
    {
      name: 'React',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Node.js',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
          <path d="M12 12v10" />
          <path d="M12 12l9-5" />
          <path d="M12 12L3 7" />
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      icon: (
        <span className="font-mono text-xs font-bold px-1 rounded bg-white/10 text-white">TS</span>
      ),
    },
  ];

  return (
    <div className="border-y border-white/[0.07] bg-[#070707] py-6 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8A8A8A] whitespace-nowrap">
              TRUSTED TECHNOLOGIES
            </span>
            <span className="hidden md:inline-block w-6 h-[1px] bg-white/15 ml-2" />
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-4">
            {techs.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 text-[#8A8A8A] hover:text-white transition-colors duration-200 group"
              >
                <span className="text-[#8A8A8A] group-hover:text-[#FF7A00] transition-colors">
                  {tech.icon}
                </span>
                <span className="text-xs tracking-wider font-medium text-[#8A8A8A] group-hover:text-white transition-colors">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
