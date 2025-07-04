# Sample Markdown Document

This is a **test markdown file** to demonstrate the new GFM rendering capabilities in the ContextViewer.

## Features Demonstrated

### Text Formatting
- **Bold text** using double asterisks
- *Italic text* using single asterisks
- `inline code` using backticks
- ~~Strikethrough text~~ using tildes

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested numbered item
3. Third numbered item

### Code Blocks

Here's a JavaScript code block:

```javascript
function greetUser(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to the markdown renderer, ${name}`;
}

// Call the function
const message = greetUser('Developer');
```

And a Python example:

```python
def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Generate first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Headers | ✅ | H1-H6 supported |
| Lists | ✅ | Ordered and unordered |
| Code | ✅ | Inline and blocks |
| Tables | ✅ | GFM table syntax |
| Links | ✅ | Standard markdown links |

### Blockquotes

> This is a blockquote example.
> 
> It can span multiple lines and provides
> a nice way to highlight important information
> or quotes from other sources.

### Links and Images

Check out the [Vue.js documentation](https://vuejs.org/) for more information.

### Horizontal Rule

---

### Task Lists (GFM Extension)

- [x] Implement markdown parsing
- [x] Add syntax highlighting
- [x] Style the rendered output
- [ ] Add more advanced features
- [ ] Test with complex documents

## Technical Details

This markdown renderer uses:
- **marked** for parsing markdown
- **marked-gfm-heading-id** for GitHub-style heading IDs
- **marked-highlight** for syntax highlighting integration
- **Prism.js** for code syntax highlighting

The renderer automatically detects markdown content based on:
1. File extension (`.md`, `.markdown`, `.mdown`)
2. Content analysis for markdown patterns

## Conclusion

The ContextViewer now supports rich markdown rendering with GitHub Flavored Markdown features, making documentation and text files much more readable and visually appealing.
