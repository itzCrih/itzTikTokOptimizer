/**
 * itzTikTok Optimizer - Test Environment Setup & Mocks
 */

// Mock Chrome Storage API
export function createMockChromeStorage(initialData = {}) {
  const store = { ...initialData };
  const listeners = [];

  return {
    local: {
      get: async (keys) => {
        if (!keys) return { ...store };
        if (typeof keys === 'string') {
          return { [keys]: store[keys] };
        }
        if (Array.isArray(keys)) {
          const res = {};
          for (const k of keys) {
            if (store[k] !== undefined) res[k] = store[k];
          }
          return res;
        }
        return { ...store };
      },
      set: async (items) => {
        const changes = {};
        for (const [k, v] of Object.entries(items)) {
          changes[k] = { oldValue: store[k], newValue: v };
          store[k] = v;
        }
        for (const cb of listeners) {
          cb(changes, 'local');
        }
      },
      clear: async () => {
        for (const k of Object.keys(store)) delete store[k];
      }
    },
    onChanged: {
      addListener: (cb) => listeners.push(cb),
      removeListener: (cb) => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      }
    }
  };
}

// Lightweight Mock Element
export class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.classList = new Set();
    this.children = [];
    this.parentNode = null;
    this.id = attributes.id || '';
    this.textContent = '';
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'id') this.id = String(val);
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camel] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'id') this.id = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  querySelector(sel) {
    for (const child of this.children) {
      if (child.matches(sel)) return child;
      const found = child.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(sel) {
    const results = [];
    for (const child of this.children) {
      if (child.matches(sel)) results.push(child);
      results.push(...child.querySelectorAll(sel));
    }
    return results;
  }

  matches(sel) {
    if (sel === '*') return true;
    if (sel.startsWith('#')) return this.id === sel.slice(1);
    if (sel.startsWith('.')) return this.classList.has(sel.slice(1));
    if (sel.includes('[')) {
      const attrMatch = sel.match(/\[([a-zA-Z0-9_-]+)([*^$]?=)?"?([^"\]]*)"?\]/);
      if (attrMatch) {
        const [, attr, op, val] = attrMatch;
        const actual = this.getAttribute(attr);
        if (!actual) return false;
        if (!op) return true;
        if (op === '=') return actual === val;
        if (op === '*=') return actual.includes(val);
        if (op === '^=') return actual.startsWith(val);
        if (op === '$=') return actual.endsWith(val);
      }
    }
    return this.tagName.toLowerCase() === sel.toLowerCase();
  }
}

// Minimal Mock Document
export class MockDocument extends MockElement {
  constructor() {
    super('document');
    this.head = new MockElement('head');
    this.body = new MockElement('body');
    this.appendChild(this.head);
    this.appendChild(this.body);
    this.documentElement = this;
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }

  getElementsByTagName(tag) {
    if (tag === '*') return this.querySelectorAll('*');
    return this.querySelectorAll(tag);
  }
}
