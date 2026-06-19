export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <span className="search-bar-icon">🔍</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || "लुगा, ब्रान्ड वा साइज खोज्नुहोस्..."}
      />
    </form>
  );
}
