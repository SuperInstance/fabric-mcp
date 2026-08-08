/**
 * Accessibility Examples for React Components
 * WCAG 2.1 AA Compliant Examples
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

/**
 * Accessible Button Example
 */
export function AccessibleButtonExample() {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      aria-pressed={pressed}
      onClick={() => setPressed(!pressed)}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {pressed ? 'Pressed' : 'Not Pressed'}
    </button>
  );
}

/**
 * Accessible Input Example
 */
export function AccessibleInputExample() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(e.target.value.length < 3 ? 'Must be at least 3 characters' : '');
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="username" className="font-medium">
        Username
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      </label>
      <input
        id="username"
        type="text"
        value={value}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-required="true"
        aria-describedby={error ? 'username-error' : undefined}
        className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <span id="username-error" className="text-red-500 text-sm" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Accessible Modal Example
 */
export function AccessibleModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const openModal = () => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    previousActiveElement.current?.focus();
  };

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Focus first focusable element
    const firstFocusable = modalRef.current.querySelector<HTMLElement>(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    // Trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Modal
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h2 id="modal-title" className="text-xl font-semibold mb-4">
              Accessible Modal
            </h2>
            <p id="modal-description" className="mb-4">
              This modal has proper focus management and keyboard navigation.
            </p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Accessible Dropdown Example
 */
export function AccessibleDropdownExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Option 1');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const options = ['Option 1', 'Option 2', 'Option 3'];

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const firstOption = dropdownRef.current?.querySelector<HTMLElement>(
          '[role="option"]:first-child'
        );
        firstOption?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="px-4 py-2 border rounded bg-white min-w-[200px] text-left"
      >
        {selectedOption}
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-activedescendant={selectedOption}
          className="absolute mt-1 w-full bg-white border rounded shadow-lg"
        >
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === selectedOption}
              onClick={() => handleSelect(option)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(option);
                }
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              tabIndex={option === selectedOption ? 0 : -1}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Accessible Form Example
 */
export function AccessibleFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.message) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h2 className="text-xl font-semibold">Contact Form</h2>

      <AccessibleInputExample />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-medium">
          Email
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-required="true"
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <span id="email-error" className="text-red-500 text-sm" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="font-medium">
          Message
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          aria-invalid={!!errors.message}
          aria-required="true"
          aria-describedby={errors.message ? 'message-error' : undefined}
          rows={4}
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
        {errors.message && (
          <span id="message-error" className="text-red-500 text-sm" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
      >
        Submit
      </button>
    </form>
  );
}

/**
 * Accessible Tabs Example
 */
export function AccessibleTabsExample() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];

  return (
    <div className="w-full">
      <div role="tablist" className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 border-b-2 focus:ring-2 focus:ring-blue-500 ${
              activeTab === index ? 'border-blue-600 text-blue-600' : 'border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab}
          role="tabpanel"
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className="p-4"
        >
          <h3 className="text-lg font-semibold mb-2">{tab} Content</h3>
          <p>This is the content for {tab.toLowerCase()}.</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Accessible Accordion Example
 */
export function AccessibleAccordionExample() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    { title: 'Item 1', content: 'Content for item 1' },
    { title: 'Item 2', content: 'Content for item 2' },
    { title: 'Item 3', content: 'Content for item 3' },
  ];

  return (
    <div className="w-full max-w-md">
      {items.map((item, index) => (
        <div key={index} className="border rounded mb-2">
          <button
            aria-expanded={openIndex === index}
            aria-controls={`accordion-panel-${index}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-2 text-left font-medium focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
          >
            {item.title}
            <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
          </button>
          <div
            id={`accordion-panel-${index}`}
            role="region"
            aria-labelledby={`accordion-header-${index}`}
            hidden={openIndex !== index}
            className="px-4 py-2 border-t"
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Accessible Checkbox Example
 */
export function AccessibleCheckboxExample() {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <span>Accept terms and conditions</span>
    </label>
  );
}

/**
 * Accessible Radio Group Example
 */
export function AccessibleRadioGroupExample() {
  const [selected, setSelected] = useState('option1');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <fieldset className="border rounded p-4">
      <legend className="font-medium">Choose an option</legend>

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="radio-group"
              value={option.value}
              checked={selected === option.value}
              onChange={(e) => setSelected(e.target.value)}
              className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Export all examples
 */
export const AccessibilityExamples = {
  AccessibleButtonExample,
  AccessibleInputExample,
  AccessibleModalExample,
  AccessibleDropdownExample,
  AccessibleFormExample,
  AccessibleTabsExample,
  AccessibleAccordionExample,
  AccessibleCheckboxExample,
  AccessibleRadioGroupExample,
};
