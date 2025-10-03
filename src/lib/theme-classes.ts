export const getThemeClasses = (isDark: boolean) => ({
  // Backgrounds
  bgPrimary: isDark ? 'bg-[#000006]' : 'bg-gray-100',
  bgSecondary: isDark ? 'bg-[#313636]' : 'bg-white',
  bgTertiary: isDark ? 'bg-[#7a7282]/10' : 'bg-gray-50',
  bgHover: isDark ? 'hover:bg-[#7a7282]/10' : 'hover:bg-gray-50',

  // Text
  textPrimary: isDark ? 'text-[#f6eef6]' : 'text-gray-900',
  textSecondary: isDark ? 'text-[#bebfd5]' : 'text-gray-700',
  textTertiary: isDark ? 'text-[#7a7282]' : 'text-gray-500',

  // Borders
  border: isDark ? 'border-[#7a7282]/20' : 'border-gray-200',
  borderHover: isDark ? 'hover:border-[#7a7282]/40' : 'hover:border-gray-300',

  // Cards
  card: isDark ? 'bg-[#313636] border border-[#7a7282]/20' : 'bg-white border border-gray-200 shadow-sm',
  cardHover: isDark ? 'hover:border-[#7a7282]/40' : 'hover:shadow-md',

  // Buttons
  btnPrimary: isDark
    ? 'bg-[#bebfd5] text-[#000006] hover:bg-[#f6eef6]'
    : 'bg-blue-600 text-white hover:bg-blue-700',
  btnSecondary: isDark
    ? 'bg-[#7a7282]/20 text-[#bebfd5] hover:bg-[#7a7282]/30 hover:text-[#f6eef6] border border-[#7a7282]/30'
    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
  btnDanger: isDark
    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
    : 'bg-red-600 text-white hover:bg-red-700',

  // Tables
  tableHeader: isDark ? 'bg-[#313636] border-b border-[#7a7282]/20' : 'bg-gray-50 border-b border-gray-200',
  tableRow: isDark ? 'border-b border-[#7a7282]/20 hover:bg-[#7a7282]/10' : 'border-b border-gray-100 hover:bg-gray-50',

  // Links
  link: isDark ? 'text-[#bebfd5] hover:text-[#f6eef6]' : 'text-blue-600 hover:text-blue-700',

  // Inputs
  input: isDark
    ? 'bg-[#313636] border-[#7a7282]/30 text-[#f6eef6] focus:border-[#bebfd5]'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',

  // Status badges
  statusPending: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800',
  statusPartial: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800',
  statusCompleted: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800',
  statusInTransit: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800',
});
