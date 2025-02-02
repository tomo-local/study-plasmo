import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"

export default function SearchBar({ value, onChange, onKeyDown, ref }) {
  return (
    <div className="flex items-center p-2 space-x-2 bg-gray-800">
      <span>
        <MagnifyingGlassIcon className="size-5" />
      </span>
      <input
        type="text"
        autoFocus
        className="w-full p-2 text-white bg-transparent rounded-lg focus:outline-none"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Search or Enter URL..."
        ref={ref}
      />
    </div>
  )
}
