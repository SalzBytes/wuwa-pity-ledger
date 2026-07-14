/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        void: '#080a10',
        panel: '#11151f',
        panel2: '#171d2b',
        panel3: '#1e2537',
        hairline: '#242c3f',
        brass: '#d9ac4f',
        brassdim: '#8a6d2f',
        brassglow: '#f2c869',
        lucky: '#34d399',
        luckydim: '#12362a',
        soft: '#f5b942',
        softdim: '#3a2c10',
        hard: '#ff5d6c',
        harddim: '#3a1418',
        ink: '#e9edf6',
        faint: '#6d7891'
      },
      boxShadow: {
        reel: 'inset 0 2px 10px rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.45)'
      }
    }
  }
}
