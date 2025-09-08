"use client";

import { useState } from "react";
import { useCombobox } from "downshift";

export interface TypeaheadInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  filterSuggestions?: (suggestions: string[], inputValue: string) => string[];
  maxSuggestions?: number;
}

export default function TypeaheadInput({
  value,
  onChange,
  suggestions,
  placeholder = "Type to search...",
  className = "",
  disabled = false,
  filterSuggestions,
  maxSuggestions = 10,
}: TypeaheadInputProps) {
  const [inputValue, setInputValue] = useState(value);

  // Default filter function - starts with matching, case insensitive
  const defaultFilter = (suggestions: string[], inputValue: string) => {
    if (!inputValue) return suggestions.slice(0, maxSuggestions);
    
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    
    return filtered.slice(0, maxSuggestions);
  };

  const filter = filterSuggestions || defaultFilter;
  const filteredSuggestions = filter(suggestions, inputValue);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    items: filteredSuggestions,
    inputValue,
    onInputValueChange: ({ inputValue: newInputValue }) => {
      if (newInputValue !== undefined) {
        setInputValue(newInputValue);
        onChange(newInputValue);
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setInputValue(selectedItem);
        onChange(selectedItem);
      }
    },
    itemToString: (item) => item || '',
  });

  // Update local input value when prop value changes
  if (value !== inputValue && !isOpen) {
    setInputValue(value);
  }

  const baseInputClasses = `
    font-mono p-2 rounded border text-sm
    focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent
    ${disabled 
      ? 'bg-elf-mid-blue/10 border-elf-mid-blue/20 text-elf-light-blue/50 cursor-not-allowed' 
      : 'bg-elf-dark-blue border-elf-mid-blue/30 text-elf-light-blue hover:border-elf-mid-blue/50'
    }
  `;

  return (
    <div className="relative">
      <input
        {...getInputProps({
          placeholder,
          disabled,
          className: `${baseInputClasses} ${className}`,
        })}
      />
      
      <div
        {...getMenuProps()}
        className={`absolute z-10 w-full mt-1 bg-elf-dark-blue border border-elf-mid-blue/30 rounded-md shadow-lg max-h-60 overflow-auto ${
          isOpen && filteredSuggestions.length > 0 ? 'block' : 'hidden'
        }`}
      >
        {filteredSuggestions.map((item, index) => (
          <div
            key={`${item}-${index}`}
            {...getItemProps({ item, index })}
            className={`px-3 py-2 cursor-pointer text-sm font-mono ${
              highlightedIndex === index
                ? 'bg-elf-mid-blue/30 text-elf-light-blue'
                : 'text-elf-light-blue/80 hover:bg-elf-mid-blue/20'
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}