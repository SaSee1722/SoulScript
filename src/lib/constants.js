export const MOODS = [
    { label: 'Happy', emoji: '😊', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Smiling%20Eyes.png', color: 'text-yellow-500' },
    { label: 'Sad', emoji: '😢', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Loudly%20Crying%20Face.png', color: 'text-blue-500' },
    { label: 'Angry', emoji: '😡', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Enraged%20Face.png', color: 'text-red-500' },
    { label: 'Sleepy', emoji: '😴', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Sleeping%20Face.png', color: 'text-purple-500' },
    { label: 'Thinking', emoji: '🤔', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Thinking%20Face.png', color: 'text-green-500' },
    { label: 'Party', emoji: '🥳', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png', color: 'text-pink-500' },
    { label: 'Sick', emoji: '🤒', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Thermometer.png', color: 'text-gray-500' },
    { label: 'Cool', emoji: '😎', image: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png', color: 'text-indigo-500' }
];

export const SEASONAL_THEMES = [
    // January - Winter (Ice Blue)
    {
        name: 'January',
        background: 'bg-gradient-to-br from-blue-100 to-blue-300',
        accent: 'text-blue-800',
        button: 'bg-blue-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/snow.png")]'
    },
    // February - Late Winter/Love (Pink/Frost)
    {
        name: 'February',
        background: 'bg-gradient-to-br from-pink-100 to-rose-200',
        accent: 'text-rose-800',
        button: 'bg-rose-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/hearts.png")]'
    },
    // March - Early Spring (Fresh Green)
    {
        name: 'March',
        background: 'bg-gradient-to-br from-green-100 to-emerald-200',
        accent: 'text-emerald-800',
        button: 'bg-emerald-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/leaf.png")]'
    },
    // April - Spring Rain (Teal/Blue)
    {
        name: 'April',
        background: 'bg-gradient-to-br from-cyan-100 to-sky-200',
        accent: 'text-sky-800',
        button: 'bg-sky-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/rain.png")]'
    },
    // May - Flowers (Pink/Purple)
    {
        name: 'May',
        background: 'bg-gradient-to-br from-fuchsia-100 to-purple-200',
        accent: 'text-purple-800',
        button: 'bg-purple-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/flowers.png")]'
    },
    // June - Early Summer (Sunny Yellow)
    {
        name: 'June',
        background: 'bg-gradient-to-br from-yellow-100 to-amber-200',
        accent: 'text-amber-800',
        button: 'bg-amber-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/sun-pattern.png")]'
    },
    // July - Mid Summer (Bright Orange)
    {
        name: 'July',
        background: 'bg-gradient-to-br from-orange-100 to-orange-300',
        accent: 'text-orange-800',
        button: 'bg-orange-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/beach.png")]'
    },
    // August - Late Summer (Gold)
    {
        name: 'August',
        background: 'bg-gradient-to-br from-yellow-200 to-yellow-400',
        accent: 'text-yellow-900',
        button: 'bg-yellow-700',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/summer.png")]'
    },
    // September - Early Autumn (Brown/Beige)
    {
        name: 'September',
        background: 'bg-gradient-to-br from-stone-100 to-stone-300',
        accent: 'text-stone-800',
        button: 'bg-stone-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/autumn.png")]'
    },
    // October - Autumn/Halloween (Orange/Purple)
    {
        name: 'October',
        background: 'bg-gradient-to-br from-orange-200 to-purple-300',
        accent: 'text-purple-900',
        button: 'bg-purple-700',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/pumpkin.png")]'
    },
    // November - Late Autumn (Grey/Muted)
    {
        name: 'November',
        background: 'bg-gradient-to-br from-gray-200 to-slate-300',
        accent: 'text-slate-800',
        button: 'bg-slate-600',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/fog.png")]'
    },
    // December - Winter/Festive (Red/Green or Snowy)
    {
        name: 'December',
        background: 'bg-gradient-to-br from-red-100 to-green-100',
        accent: 'text-red-800',
        button: 'bg-red-700',
        overlay: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/snow-flakes.png")]'
    }
];
