// Reusable rule functions for validation of form inputs
export function required() { return (str: string) => !!str || 'Required' }
export function maxChars(n: number) { return (str: string) => str.length <= n || `Maximum ${n} characters` }
export function minChars(n: number) { return (str:string) => str.length >= n || `Minimum ${n} characters` }
export function alphaFirst() { return (str: string) => /^[A-Za-z]+.*$/.test(str) || 'First character must be a letter' }
export function safeChars() { return (str: string) => /^[\w\.]+$/.test(str) || 'Only letters, numbers, _, and . allowed' }