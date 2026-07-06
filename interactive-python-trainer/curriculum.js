/*
 * Curriculum for the Interactive Python Trainer, organized into COURSES.
 *
 * COURSES = [ { id, title, tracks: [ { title, lessons: [...] } ] } ]
 *
 * Each lesson:
 *   id            unique string (unique across ALL courses)
 *   title         shown in the sidebar
 *   content       HTML string (rendered into the lesson pane)
 *   starter       Python code loaded into the editor
 *   packages      OPTIONAL Pyodide packages to load first, e.g. ["numpy"],
 *                   ["pandas"], ["scikit-learn"]
 *   exercise      { prompt, expectedOutput?, test? }
 *                   - expectedOutput: exact stdout to match (trimmed)
 *                   - test: Python assertions run AFTER the learner's code,
 *                           sharing the same namespace. Raise = fail.
 *
 * 84 lessons: Core Python (21) + AI/ML (21) + Data & Biomedical (21) + PM (21).
 * Add courses/tracks/lessons freely — no build step, just reload.
 */

const COURSES = [

  /* ======================================================================
   * CORE PYTHON  (21)
   * ==================================================================== */
  {
    id: "core",
    title: "Core Python",
    tracks: [
      {
        title: "Beginner",
        lessons: [
          {
            id: "b-hello",
            title: "Hello, World!",
            content: `
              <p>Every journey starts with <code>print()</code>. It sends text to the
              output console below the editor.</p>
              <pre><code>print("Hello, World!")</code></pre>
              <p><code>print</code> is a <b>function</b>. You <b>call</b> it by putting
              parentheses after its name, and pass it an <b>argument</b> (the text) inside
              quotes. Text in quotes is called a <b>string</b>.</p>
              <p>Press <b>Run</b> to execute your code, or <b>Check</b> to grade the exercise.</p>
            `,
            starter: `# Print exactly: Hello, World!\n`,
            exercise: { prompt: 'Make the program print exactly <code>Hello, World!</code>', expectedOutput: "Hello, World!" }
          },
          {
            id: "b-variables",
            title: "Variables & Types",
            content: `
              <p>A <b>variable</b> is a name that refers to a value. You create one with
              <code>=</code> (assignment):</p>
              <pre><code>name = "Ada"      # a string (str)
age = 36           # a whole number (int)
height = 1.7        # a decimal number (float)
is_engineer = True  # a boolean (bool)</code></pre>
              <p>Python figures out the type from the value — you never declare it.</p>
            `,
            starter: `# Create a variable 'name' set to the string "Ada"\n# Create a variable 'age' set to the number 36\n`,
            exercise: { prompt: 'Create <code>name = "Ada"</code> and <code>age = 36</code>.', test: `assert name == "Ada"\nassert age == 36` }
          },
          {
            id: "b-strings",
            title: "Strings & f-strings",
            content: `
              <p>Strings hold text. The modern way to build them is the <b>f-string</b> —
              put an <code>f</code> before the quotes and drop variables inside <code>{ }</code>:</p>
              <pre><code>name = "Sam"
message = f"Hello, {name}!"   # -> "Hello, Sam!"</code></pre>
              <p>A <b>function</b> packages logic to reuse. <code>def</code> defines one;
              <code>return</code> hands a value back:</p>
              <pre><code>def shout(text):
    return text.upper() + "!"</code></pre>
            `,
            starter: `def greet(name):\n    # Return "Hello, <name>!" using an f-string\n    pass\n`,
            exercise: { prompt: 'Write <code>greet(name)</code> returning <code>"Hello, &lt;name&gt;!"</code>.', test: `assert greet("Sam") == "Hello, Sam!"\nassert greet("Ada") == "Hello, Ada!"` }
          },
          {
            id: "b-numbers",
            title: "Numbers & Arithmetic",
            content: `
              <p>Python does math with the usual operators:</p>
              <pre><code>a + b    # add
a - b    # subtract
a * b    # multiply
a / b    # divide (float)
a // b   # floor divide
a % b    # remainder
a ** b   # power</code></pre>
            `,
            starter: `def rectangle_area(width, height):\n    # Return the area of the rectangle\n    pass\n`,
            exercise: { prompt: 'Write <code>rectangle_area(width, height)</code> returning width × height.', test: `assert rectangle_area(3, 4) == 12\nassert rectangle_area(5, 5) == 25\nassert rectangle_area(0, 9) == 0` }
          },
          {
            id: "b-lists",
            title: "Lists & Indexing",
            content: `
              <p>A <b>list</b> is an ordered collection, written with square brackets:</p>
              <pre><code>items = ["a", "b", "c"]
items[0]    # "a"  (indexing starts at 0)
items[-1]   # "c"  (negative counts from the end)
len(items)  # 3</code></pre>
            `,
            starter: `def first_and_last(items):\n    # Return a tuple (first_item, last_item)\n    pass\n`,
            exercise: { prompt: 'Write <code>first_and_last(items)</code> returning a tuple of the first and last elements.', test: `assert first_and_last([1, 2, 3]) == (1, 3)\nassert first_and_last(["x", "y", "z", "w"]) == ("x", "w")` }
          },
          {
            id: "b-conditionals",
            title: "Conditionals",
            content: `
              <p>Use <code>if / elif / else</code> to make decisions:</p>
              <pre><code>if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "F"</code></pre>
              <p>Indentation (4 spaces) groups the body of an <code>if</code>.</p>
            `,
            starter: `def grade(score):\n    # A: 90+, B: 80-89, C: 70-79, D: 60-69, else F\n    pass\n`,
            exercise: { prompt: 'Write <code>grade(score)</code> returning "A"/"B"/"C"/"D"/"F".', test: `assert grade(95) == "A"\nassert grade(85) == "B"\nassert grade(72) == "C"\nassert grade(61) == "D"\nassert grade(40) == "F"` }
          },
          {
            id: "b-loops",
            title: "Loops",
            content: `
              <p>A <code>for</code> loop repeats over a sequence:</p>
              <pre><code>total = 0
for n in [1, 2, 3]:
    total = total + n   # 6</code></pre>
              <p>Check membership with <code>in</code>: <code>if c in "aeiou":</code></p>
            `,
            starter: `def count_vowels(text):\n    # Return how many of a,e,i,o,u appear (case-insensitive)\n    pass\n`,
            exercise: { prompt: 'Write <code>count_vowels(text)</code> counting vowels (any case).', test: `assert count_vowels("Hello") == 2\nassert count_vowels("AEIOU") == 5\nassert count_vowels("xyz") == 0` }
          },
          {
            id: "b-functions",
            title: "Functions & Loops Together",
            content: `
              <p>Combine a function with a loop that builds up a result. Factorial:
              5! = 5 × 4 × 3 × 2 × 1 = 120.</p>
              <pre><code>def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result = result * i
    return result</code></pre>
            `,
            starter: `def factorial(n):\n    # Return n! (0! is 1)\n    pass\n`,
            exercise: { prompt: 'Write <code>factorial(n)</code>. Remember <code>factorial(0) == 1</code>.', test: `assert factorial(0) == 1\nassert factorial(1) == 1\nassert factorial(5) == 120\nassert factorial(6) == 720` }
          },
          {
            id: "b-while", title: "While Loops",
            content: `<p>A <code>while</code> loop repeats as long as its condition stays true — update something inside so it eventually stops:</p>
              <pre><code>i = 3
while i > 0:
    print(i)
    i = i - 1</code></pre>`,
            starter: 'def count_down(n):\n    # Return a list [n, n-1, ..., 1] using a while loop\n    pass\n',
            exercise: { prompt: 'Write <code>count_down(n)</code> using a <code>while</code> loop.', test: 'assert count_down(3) == [3, 2, 1]\nassert count_down(0) == []\nassert count_down(1) == [1]' }
          },
          {
            id: "b-sets", title: "Sets",
            content: `<p>A <b>set</b> is an unordered collection of <b>unique</b> items — perfect for removing duplicates:</p>
              <pre><code>set([1, 1, 2])   # {1, 2}
len(set(items))   # how many distinct values</code></pre>`,
            starter: 'def unique_count(items):\n    # Return how many distinct values are in items\n    pass\n',
            exercise: { prompt: 'Write <code>unique_count(items)</code> returning the number of distinct values.', test: 'assert unique_count([1, 1, 2, 3, 3, 3]) == 3\nassert unique_count([]) == 0\nassert unique_count(["a", "a"]) == 1' }
          },
          {
            id: "b-convert", title: "Converting Types",
            content: `<p>Convert between types with <code>int()</code>, <code>float()</code>, and <code>str()</code>. Input from users and files is text until you convert it:</p>
              <pre><code>int("42") + 1     # 43
str(42) + "!"      # "42!"</code></pre>`,
            starter: 'def sum_strings(strings):\n    # strings is a list of numeric strings; return their integer sum\n    pass\n',
            exercise: { prompt: 'Write <code>sum_strings(strings)</code> that adds up a list of numeric strings.', test: 'assert sum_strings(["1", "2", "3"]) == 6\nassert sum_strings([]) == 0\nassert sum_strings(["10", "-4"]) == 6' }
          },
          {
            id: "b-defaults", title: "Default & Keyword Arguments",
            content: `<p>Parameters can have <b>defaults</b>, and callers can pass arguments <b>by name</b>:</p>
              <pre><code>def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Sam")                 # "Hello, Sam!"
greet("Sam", greeting="Hi")   # "Hi, Sam!"</code></pre>`,
            starter: 'def greet(name, greeting="Hello"):\n    # Return "<greeting>, <name>!"\n    pass\n',
            exercise: { prompt: 'Write <code>greet(name, greeting="Hello")</code>.', test: 'assert greet("Sam") == "Hello, Sam!"\nassert greet("Sam", "Hi") == "Hi, Sam!"\nassert greet("Ada", greeting="Hey") == "Hey, Ada!"' }
          },
          {
            id: "b-range", title: "range() and Steps",
            content: `<p><code>range(start, stop, step)</code> generates numbers, with the stop <i>excluded</i>:</p>
              <pre><code>list(range(0, 10, 2))   # [0, 2, 4, 6, 8]</code></pre>`,
            starter: 'def even_numbers(n):\n    # Return a list of even numbers from 0 up to (not including) n\n    pass\n',
            exercise: { prompt: 'Write <code>even_numbers(n)</code> using <code>range</code> with a step.', test: 'assert even_numbers(10) == [0, 2, 4, 6, 8]\nassert even_numbers(1) == [0]\nassert even_numbers(0) == []' }
          }
        ]
      },
      {
        title: "Intermediate",
        lessons: [
          {
            id: "i-dicts",
            title: "Dictionaries",
            content: `
              <p>A <b>dictionary</b> maps keys to values:</p>
              <pre><code>counts = {}
counts["a"] = counts.get("a", 0) + 1</code></pre>
              <p>Dictionaries are perfect for counting and grouping.</p>
            `,
            starter: `def word_count(text):\n    # Return a dict mapping each space-separated word to its count\n    pass\n`,
            exercise: { prompt: 'Write <code>word_count(text)</code> counting occurrences of each word.', test: `assert word_count("a b a") == {"a": 2, "b": 1}\nassert word_count("hi") == {"hi": 1}\nassert word_count("") == {}` }
          },
          {
            id: "i-comprehensions",
            title: "List Comprehensions",
            content: `
              <p>A <b>list comprehension</b> builds a list in one expression:</p>
              <pre><code>[x * x for x in nums if x % 2 == 0]   # squares of evens</code></pre>
            `,
            starter: `def squares_of_evens(nums):\n    # Return a list of the squares of the even numbers, in order\n    pass\n`,
            exercise: { prompt: 'Write <code>squares_of_evens(nums)</code> using a comprehension.', test: `assert squares_of_evens([1, 2, 3, 4]) == [4, 16]\nassert squares_of_evens([2, 4, 6]) == [4, 16, 36]\nassert squares_of_evens([1, 3, 5]) == []` }
          },
          {
            id: "i-tuples",
            title: "Tuples & Unpacking",
            content: `
              <p>A <b>tuple</b> is an immutable sequence. Functions often return several
              values as a tuple, which you can <b>unpack</b>:</p>
              <pre><code>low, high = min_max([3, 1, 2])   # low=1, high=3</code></pre>
            `,
            starter: `def min_max(nums):\n    # Return a tuple (smallest, largest)\n    pass\n`,
            exercise: { prompt: 'Write <code>min_max(nums)</code> returning <code>(min, max)</code>.', test: `assert min_max([3, 1, 2]) == (1, 3)\nassert min_max([5]) == (5, 5)\nassert min_max([-2, 0, 9, 4]) == (-2, 9)` }
          },
          {
            id: "i-errors",
            title: "Error Handling",
            content: `
              <p>When code might fail, wrap it in <code>try / except</code>:</p>
              <pre><code>try:
    result = a / b
except ZeroDivisionError:
    result = None</code></pre>
            `,
            starter: `def safe_divide(a, b):\n    # Return a / b, or None if b is 0\n    pass\n`,
            exercise: { prompt: 'Write <code>safe_divide(a, b)</code> returning <code>None</code> on division by zero.', test: `assert safe_divide(6, 2) == 3\nassert safe_divide(1, 0) is None\nassert safe_divide(9, 3) == 3` }
          },
          {
            id: "i-strings2",
            title: "String Processing",
            content: `
              <p>Strings have powerful methods and slicing:</p>
              <pre><code>s.lower()          # lowercase
s.replace(" ", "")  # remove spaces
s[::-1]             # reversed</code></pre>
            `,
            starter: `def is_palindrome(s):\n    # True if s reads the same forwards/backwards,\n    # ignoring case and spaces\n    pass\n`,
            exercise: { prompt: 'Write <code>is_palindrome(s)</code> ignoring case and spaces.', test: `assert is_palindrome("Race car") is True\nassert is_palindrome("hello") is False\nassert is_palindrome("Was it a car or a cat I saw") is True` }
          },
          {
            id: "i-oop",
            title: "Classes & Objects",
            content: `
              <p>A <b>class</b> bundles data and behavior. <code>__init__</code> sets up a
              new instance; <code>self</code> refers to it:</p>
              <pre><code>class Counter:
    def __init__(self):
        self.value = 0
    def increment(self):
        self.value += 1</code></pre>
            `,
            starter: `class Counter:\n    def __init__(self):\n        # start value at 0\n        pass\n\n    def increment(self):\n        # add 1 to value\n        pass\n`,
            exercise: { prompt: 'Build a <code>Counter</code> with a <code>value</code> starting at 0 and an <code>increment()</code> method.', test: `c = Counter()\nassert c.value == 0\nc.increment()\nc.increment()\nc.increment()\nassert c.value == 3` }
          },
          {
            id: "i-stdlib",
            title: "The Standard Library",
            content: `
              <p>Bring modules in with <code>import</code>:</p>
              <pre><code>import math
math.hypot(3, 4)   # 5.0</code></pre>
            `,
            starter: `import math\n\ndef hypotenuse(a, b):\n    # Return the hypotenuse length for legs a and b\n    pass\n`,
            exercise: { prompt: 'Write <code>hypotenuse(a, b)</code> using <code>math</code>.', test: `assert abs(hypotenuse(3, 4) - 5.0) < 1e-9\nassert abs(hypotenuse(5, 12) - 13.0) < 1e-9` }
          },
          {
            id: "i-slicing", title: "Slicing",
            content: `<p><b>Slicing</b> takes a portion of a sequence: <code>seq[start:stop]</code> (stop excluded). Negative indices count from the end:</p>
              <pre><code>items[1:-1]   # everything except first and last
items[::-1]    # reversed</code></pre>`,
            starter: 'def middle(items):\n    # Return all elements except the first and last\n    pass\n',
            exercise: { prompt: 'Write <code>middle(items)</code> using a slice.', test: 'assert middle([1, 2, 3, 4, 5]) == [2, 3, 4]\nassert middle([1, 2]) == []\nassert middle([1, 2, 3]) == [2]' }
          },
          {
            id: "i-nested", title: "Nested Data",
            content: `<p>Real data nests — a list of dictionaries models rows of records:</p>
              <pre><code>people = [{"name": "Ann", "age": 30}, {"name": "Bo", "age": 15}]
[p["name"] for p in people if p["age"] >= 18]</code></pre>`,
            starter: 'def names_of_adults(people):\n    # people: list of {"name":..., "age":...}; return names where age >= 18\n    pass\n',
            exercise: { prompt: 'Write <code>names_of_adults(people)</code>.', test: 'people = [{"name": "a", "age": 20}, {"name": "b", "age": 15}, {"name": "c", "age": 18}]\nassert names_of_adults(people) == ["a", "c"]' }
          },
          {
            id: "i-enumerate", title: "enumerate & zip",
            content: `<p><code>enumerate</code> gives the index with each item; <code>zip</code> pairs two sequences:</p>
              <pre><code>for i, x in enumerate(items, 1): ...   # 1-based index
dict(zip(names, scores))                 # {name: score, ...}</code></pre>`,
            starter: 'def numbered(items):\n    # Return ["1. <item>", "2. <item>", ...] using enumerate (starting at 1)\n    pass\n\ndef pair_up(names, scores):\n    # Return a dict mapping each name to its score using zip\n    pass\n',
            exercise: { prompt: 'Write <code>numbered(items)</code> and <code>pair_up(names, scores)</code>.', test: 'assert numbered(["a", "b"]) == ["1. a", "2. b"]\nassert numbered([]) == []\nassert pair_up(["a", "b"], [1, 2]) == {"a": 1, "b": 2}' }
          },
          {
            id: "i-dictcomp", title: "Dict Comprehensions",
            content: `<p>A <b>dict comprehension</b> builds a dictionary in one expression:</p>
              <pre><code>{i: i * i for i in range(1, n + 1)}</code></pre>`,
            starter: 'def squares_dict(n):\n    # Return {1: 1, 2: 4, ..., n: n*n}\n    pass\n',
            exercise: { prompt: 'Write <code>squares_dict(n)</code> with a dict comprehension.', test: 'assert squares_dict(3) == {1: 1, 2: 4, 3: 9}\nassert squares_dict(0) == {}\nassert squares_dict(1) == {1: 1}' }
          },
          {
            id: "i-lambda", title: "Lambda & Sorting Keys",
            content: `<p>A <b>lambda</b> is a tiny anonymous function, handy as a <code>key</code> for sorting:</p>
              <pre><code>sorted(words, key=lambda w: len(w))   # shortest first</code></pre>`,
            starter: 'def sort_by_length(words):\n    # Return words sorted shortest-first (keep equal lengths in order)\n    pass\n',
            exercise: { prompt: 'Write <code>sort_by_length(words)</code> using a lambda key.', test: 'assert sort_by_length(["ccc", "a", "bb"]) == ["a", "bb", "ccc"]\nassert sort_by_length(["aa", "bb"]) == ["aa", "bb"]' }
          },
          {
            id: "i-mutability", title: "Mutability & Copies",
            content: `<p>Lists are <b>mutable</b> and passed by reference — two names can point to the same list. To avoid surprises, build a <i>new</i> list instead of changing the input:</p>
              <pre><code>new = original + [item]   # original is untouched</code></pre>`,
            starter: 'def add_item(shopping, item):\n    # Return a NEW list with item added, without modifying the original\n    pass\n',
            exercise: { prompt: 'Write <code>add_item(shopping, item)</code> that does not mutate its input.', test: 'orig = [1, 2]\nnew = add_item(orig, 3)\nassert new == [1, 2, 3]\nassert orig == [1, 2]' }
          }
        ]
      },
      {
        title: "Expert",
        lessons: [
          {
            id: "e-decorators",
            title: "Decorators",
            content: `
              <p>A <b>decorator</b> wraps a function to add behavior:</p>
              <pre><code>def double(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs) * 2
    return wrapper</code></pre>
              <p><code>@double</code> above <code>add</code> means <code>add = double(add)</code>.</p>
            `,
            starter: `def double(func):\n    # Return a wrapper that doubles func's return value\n    pass\n\n@double\ndef add(a, b):\n    return a + b\n`,
            exercise: { prompt: 'Write the <code>double</code> decorator so <code>add(2, 3) == 10</code>.', test: `assert add(2, 3) == 10\nassert add(0, 0) == 0\nassert add(-1, 5) == 8` }
          },
          {
            id: "e-generators",
            title: "Generators",
            content: `
              <p>A <b>generator</b> produces values lazily with <code>yield</code>:</p>
              <pre><code>def countdown(n):
    while n > 0:
        yield n
        n -= 1</code></pre>
            `,
            starter: `def countdown(n):\n    # Yield n, n-1, ..., 1\n    pass\n`,
            exercise: { prompt: 'Write the <code>countdown(n)</code> generator.', test: `assert list(countdown(3)) == [3, 2, 1]\nassert list(countdown(1)) == [1]\nassert list(countdown(0)) == []` }
          },
          {
            id: "e-args",
            title: "*args & **kwargs",
            content: `
              <p><code>*args</code> collects extra positional arguments into a tuple:</p>
              <pre><code>def my_sum(*args):
    return sum(args)</code></pre>
            `,
            starter: `def my_sum(*args):\n    # Return the sum of all arguments (0 if none)\n    pass\n`,
            exercise: { prompt: 'Write <code>my_sum(*args)</code> summing any number of arguments.', test: `assert my_sum(1, 2, 3) == 6\nassert my_sum() == 0\nassert my_sum(10) == 10\nassert my_sum(-1, 1, -1, 1) == 0` }
          },
          {
            id: "e-dunder",
            title: "Dunder Methods",
            content: `
              <p>Special methods let objects work with operators. <code>__add__</code>
              powers <code>+</code>; <code>__eq__</code> powers <code>==</code>.</p>
            `,
            starter: `class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        # Return a new Vector that is the sum\n        pass\n\n    def __eq__(self, other):\n        # Return True if both components match\n        pass\n`,
            exercise: { prompt: 'Implement <code>__add__</code> and <code>__eq__</code> for <code>Vector</code>.', test: `assert Vector(1, 2) + Vector(3, 4) == Vector(4, 6)\nassert Vector(1, 2) == Vector(1, 2)\nassert not (Vector(1, 2) == Vector(2, 1))` }
          },
          {
            id: "e-functional",
            title: "Functional Style",
            content: `
              <p>Generator expressions fed to built-ins express transformations cleanly:</p>
              <pre><code>sum(x * x for x in nums if x % 2 == 1)</code></pre>
            `,
            starter: `def sum_of_squares_of_odds(nums):\n    # Sum the squares of the odd numbers in nums\n    pass\n`,
            exercise: { prompt: 'Write <code>sum_of_squares_of_odds(nums)</code>.', test: `assert sum_of_squares_of_odds([1, 2, 3, 4, 5]) == 35\nassert sum_of_squares_of_odds([2, 4, 6]) == 0\nassert sum_of_squares_of_odds([]) == 0` }
          },
          {
            id: "e-recursion",
            title: "Recursion",
            content: `
              <p>A <b>recursive</b> function calls itself until a <b>base case</b>:</p>
              <pre><code>def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)</code></pre>
            `,
            starter: `def fib(n):\n    # Return the nth Fibonacci number (fib(0)=0, fib(1)=1)\n    pass\n`,
            exercise: { prompt: 'Write <code>fib(n)</code> recursively.', test: `assert fib(0) == 0\nassert fib(1) == 1\nassert fib(7) == 13\nassert fib(10) == 55` }
          },
          {
            id: "e-inheritance", title: "Inheritance & Polymorphism",
            content: `<p><b>Inheritance</b> lets a class reuse and override another. Subclasses can answer the same method differently (<b>polymorphism</b>):</p>
              <pre><code>class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "Woof"</code></pre>`,
            starter: 'class Animal:\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    # override speak() to return "Woof"\n    pass\n\nclass Cat(Animal):\n    # override speak() to return "Meow"\n    pass\n',
            exercise: { prompt: 'Make <code>Dog</code> and <code>Cat</code> subclasses that override <code>speak()</code>.', test: 'assert Dog().speak() == "Woof"\nassert Cat().speak() == "Meow"\nassert isinstance(Dog(), Animal) and isinstance(Cat(), Animal)' }
          },
          {
            id: "e-exceptions2", title: "Raising Exceptions",
            content: `<p>Signal errors yourself with <code>raise</code>; callers catch them with <code>try/except</code>:</p>
              <pre><code>def f(x):
    if x < 0:
        raise ValueError("no negatives")
    return x</code></pre>`,
            starter: 'def safe_sqrt(x):\n    # Return the square root of x, but raise ValueError if x is negative\n    pass\n',
            exercise: { prompt: 'Write <code>safe_sqrt(x)</code> that raises <code>ValueError</code> for negative input.', test: 'assert safe_sqrt(9) == 3.0\nok = False\ntry:\n    safe_sqrt(-1)\nexcept ValueError:\n    ok = True\nassert ok' }
          },
          {
            id: "e-closures", title: "Closures",
            content: `<p>A <b>closure</b> remembers variables from where it was created — here, a counter that keeps its own state:</p>
              <pre><code>def make_counter():
    count = [0]
    def inc():
        count[0] += 1
        return count[0]
    return inc</code></pre>`,
            starter: 'def make_counter():\n    # Return a function that returns 1, then 2, then 3, ... on each call\n    pass\n',
            exercise: { prompt: 'Write <code>make_counter()</code> returning an incrementing counter function.', test: 'c = make_counter()\nassert c() == 1 and c() == 2 and c() == 3\nd = make_counter()\nassert d() == 1' }
          },
          {
            id: "e-context", title: "Context Managers",
            content: `<p>A <b>context manager</b> runs setup and cleanup around a <code>with</code> block via <code>__enter__</code> and <code>__exit__</code> (this is how <code>open()</code> always closes the file):</p>`,
            starter: 'class Bracket:\n    def __init__(self, log):\n        self.log = log\n\n    def __enter__(self):\n        # append "open" to self.log and return self\n        pass\n\n    def __exit__(self, *args):\n        # append "close" to self.log\n        pass\n',
            exercise: { prompt: 'Implement <code>__enter__</code> and <code>__exit__</code> so the log records open/close.', test: 'log = []\nwith Bracket(log):\n    log.append("inside")\nassert log == ["open", "inside", "close"]' }
          },
          {
            id: "e-flatten", title: "Nested Comprehensions",
            content: `<p>Comprehensions can nest loops. This <b>flattens</b> a 2-D list into one:</p>
              <pre><code>[x for row in matrix for x in row]</code></pre>`,
            starter: 'def flatten(matrix):\n    # Turn a list of lists into a single flat list, in order\n    pass\n',
            exercise: { prompt: 'Write <code>flatten(matrix)</code> with a nested comprehension.', test: 'assert flatten([[1, 2], [3, 4]]) == [1, 2, 3, 4]\nassert flatten([]) == []\nassert flatten([[1], [2, 3], []]) == [1, 2, 3]' }
          }
        ]
      }
    ]
  },

  /* ======================================================================
   * AI & MACHINE LEARNING  (21)
   * ==================================================================== */
  {
    id: "ai",
    title: "AI & Machine Learning",
    tracks: [
      {
        title: "Foundations (NumPy)",
        lessons: [
          {
            id: "ai-arrays", title: "NumPy Arrays", packages: ["numpy"],
            content: `<p>ML is built on vectors and matrices. NumPy gives Python fast array math.
              (It loads on first Run — a few seconds.)</p>
              <pre><code>import numpy as np
a = np.array([1, 2, 3])
a * 2        # array([2, 4, 6]) — "vectorized"</code></pre>`,
            starter: 'import numpy as np\n\ndef scale(arr, k):\n    # Return the array with every element multiplied by k\n    pass\n',
            exercise: { prompt: 'Write <code>scale(arr, k)</code> returning <code>arr</code> times <code>k</code>.', test: 'import numpy as np\nassert np.allclose(scale(np.array([1.0, 2, 3]), 3), [3, 6, 9])\nassert np.allclose(scale(np.array([0.0, -1, 2]), 5), [0, -5, 10])' }
          },
          {
            id: "ai-dot", title: "Vectors & Dot Product", packages: ["numpy"],
            content: `<p>The <b>dot product</b> multiplies two vectors elementwise and sums — the core
              of every neural-network layer.</p>
              <pre><code>np.dot([1, 2, 3], [4, 5, 6])   # 32</code></pre>`,
            starter: 'import numpy as np\n\ndef dot(a, b):\n    # Return the dot product of vectors a and b as a float\n    pass\n',
            exercise: { prompt: 'Write <code>dot(a, b)</code> returning the dot product as a float.', test: 'import numpy as np\nassert abs(dot(np.array([1, 2, 3]), np.array([4, 5, 6])) - 32) < 1e-9\nassert abs(dot(np.array([1.0, 0]), np.array([0, 1.0]))) < 1e-9' }
          },
          {
            id: "ai-normalize", title: "Feature Scaling", packages: ["numpy"],
            content: `<p><b>Min-max normalization</b> rescales values into [0, 1] so features share a range:</p>
              <pre><code>(arr - arr.min()) / (arr.max() - arr.min())</code></pre>`,
            starter: 'import numpy as np\n\ndef normalize(arr):\n    # Min-max scale the array so values lie in [0, 1]\n    pass\n',
            exercise: { prompt: 'Write <code>normalize(arr)</code> (min-max scaling).', test: 'import numpy as np\nassert np.allclose(normalize(np.array([0.0, 5, 10])), [0, 0.5, 1])\nassert np.allclose(normalize(np.array([2.0, 4, 6, 8])), [0, 1/3, 2/3, 1])' }
          },
          {
            id: "ai-distance", title: "Distances & Nearest Neighbor", packages: ["numpy"],
            content: `<p>Many algorithms rank points by <b>distance</b>:</p>
              <pre><code>dists = np.linalg.norm(points - q, axis=1)
np.argmin(dists)   # index of the closest row</code></pre>`,
            starter: 'import numpy as np\n\ndef nearest(points, q):\n    # Return the index of the row in points closest to q (Euclidean)\n    pass\n',
            exercise: { prompt: 'Write <code>nearest(points, q)</code> returning the index of the nearest row.', test: 'import numpy as np\npts = np.array([[0, 0], [10, 10], [1, 1]])\nassert nearest(pts, np.array([2, 2])) == 2\nassert nearest(pts, np.array([9, 9])) == 1' }
          },
          {
            id: "ai-matrix", title: "Matrix Multiplication", packages: ["numpy"],
            content: `<p>A neural network layer is a matrix multiply. The <code>@</code> operator does it:</p>
              <pre><code>A @ B      # matrix product
np.eye(2)  # 2x2 identity</code></pre>`,
            starter: 'import numpy as np\n\ndef matmul(A, B):\n    # Return the matrix product of A and B\n    pass\n',
            exercise: { prompt: 'Write <code>matmul(A, B)</code> returning the matrix product.', test: 'import numpy as np\nA = np.array([[1, 2], [3, 4]]); B = np.array([[5, 6], [7, 8]])\nassert np.allclose(matmul(A, B), [[19, 22], [43, 50]])\nassert np.allclose(matmul(np.eye(2), A), A)' }
          },
          {
            id: "ai-standardize", title: "Standardization (z-score)", packages: ["numpy"],
            content: `<p><b>Standardizing</b> gives data mean 0 and standard deviation 1 — what most models expect:</p>
              <pre><code>(arr - arr.mean()) / arr.std()</code></pre>`,
            starter: 'import numpy as np\n\ndef standardize(arr):\n    # Return (arr - mean) / std\n    pass\n',
            exercise: { prompt: 'Write <code>standardize(arr)</code> (mean 0, std 1).', test: 'import numpy as np\ns = standardize(np.array([1.0, 2, 3, 4, 5]))\nassert abs(s.mean()) < 1e-9\nassert abs(s.std() - 1.0) < 1e-9' }
          },
          {
            id: "ai-onehot", title: "One-Hot Encoding", packages: ["numpy"],
            content: `<p>Categories become vectors. Label 2 of 3 classes → <code>[0, 0, 1]</code>. A neat trick
              indexes the identity matrix:</p>
              <pre><code>np.eye(num_classes)[labels]</code></pre>`,
            starter: 'import numpy as np\n\ndef one_hot(labels, num_classes):\n    # Return a matrix where row i is the one-hot vector for labels[i]\n    pass\n',
            exercise: { prompt: 'Write <code>one_hot(labels, num_classes)</code>.', test: 'import numpy as np\nassert np.allclose(one_hot(np.array([0, 2, 1]), 3), [[1, 0, 0], [0, 0, 1], [0, 1, 0]])' }
          }
        ]
      },
      {
        title: "Modeling & Metrics",
        lessons: [
          {
            id: "ai-linear", title: "Predictions & Loss (MSE)", packages: ["numpy"],
            content: `<p>A linear model predicts <code>y = X·w + b</code>. Error is <b>mean squared error</b>:</p>
              <pre><code>np.mean((y_true - y_pred) ** 2)</code></pre>`,
            starter: 'import numpy as np\n\ndef predict(X, w, b):\n    # Return X . w + b\n    pass\n\ndef mse(y_true, y_pred):\n    # Return the mean squared error as a float\n    pass\n',
            exercise: { prompt: 'Write <code>predict(X, w, b)</code> and <code>mse(y_true, y_pred)</code>.', test: 'import numpy as np\nX = np.array([[1.0, 2], [3, 4]]); w = np.array([1.0, 1])\nassert np.allclose(predict(X, w, 0.0), [3, 7])\nassert np.allclose(predict(X, w, 1.0), [4, 8])\nassert abs(mse(np.array([1.0, 2, 3]), np.array([1.0, 2, 4])) - (1/3)) < 1e-9' }
          },
          {
            id: "ai-sigmoid", title: "The Sigmoid Function", packages: ["numpy"],
            content: `<p>Classifiers squash scores into probabilities with the <b>sigmoid</b>:</p>
              <pre><code>1 / (1 + e^(-x))     # sigmoid(0) == 0.5</code></pre>`,
            starter: 'import numpy as np\n\ndef sigmoid(x):\n    # Return 1 / (1 + e^(-x)); works on numbers and arrays\n    pass\n',
            exercise: { prompt: 'Write <code>sigmoid(x)</code>.', test: 'import numpy as np\nassert abs(sigmoid(0) - 0.5) < 1e-9\nassert sigmoid(100) > 0.99\nassert sigmoid(-100) < 0.01\nassert np.allclose(sigmoid(np.array([0.0, 0.0])), [0.5, 0.5])' }
          },
          {
            id: "ai-mae", title: "Mean Absolute Error", packages: ["numpy"],
            content: `<p><b>MAE</b> is the average absolute difference — less sensitive to outliers than MSE:</p>
              <pre><code>np.mean(np.abs(y_true - y_pred))</code></pre>`,
            starter: 'import numpy as np\n\ndef mae(y_true, y_pred):\n    # Return the mean absolute error as a float\n    pass\n',
            exercise: { prompt: 'Write <code>mae(y_true, y_pred)</code>.', test: 'assert abs(mae([1, 2, 3], [1, 2, 3])) < 1e-9\nassert abs(mae([1.0, 2, 3], [2, 2, 3]) - (1/3)) < 1e-9' }
          },
          {
            id: "ai-accuracy", title: "Classification Accuracy", packages: ["numpy"],
            content: `<p><b>Accuracy</b> is the fraction of predictions that match the truth:</p>
              <pre><code>np.mean(y_true == y_pred)</code></pre>`,
            starter: 'import numpy as np\n\ndef accuracy(y_true, y_pred):\n    # Return the fraction of matching predictions (0..1)\n    pass\n',
            exercise: { prompt: 'Write <code>accuracy(y_true, y_pred)</code>.', test: 'assert accuracy([1, 0, 1, 1], [1, 0, 0, 1]) == 0.75\nassert accuracy([1, 1], [0, 0]) == 0.0' }
          },
          {
            id: "ai-gradient", title: "Gradient Descent Step", packages: ["numpy"],
            content: `<p>Training nudges parameters against the gradient of the loss. For MSE with one feature:</p>
              <pre><code>dw = mean(2 * (pred - y) * x)
db = mean(2 * (pred - y))
w -= lr * dw;  b -= lr * db</code></pre>`,
            starter: 'import numpy as np\n\ndef gradient_step(x, y, w, b, lr):\n    # One gradient-descent step for y = w*x + b (MSE loss).\n    # Return the updated (w, b).\n    pass\n',
            exercise: { prompt: 'Write <code>gradient_step(x, y, w, b, lr)</code> returning the updated <code>(w, b)</code>.', test: 'w, b = gradient_step([1], [2], 0.0, 0.0, 0.1)\nassert abs(w - 0.4) < 1e-9 and abs(b - 0.4) < 1e-9\nw, b = gradient_step([1, 2], [2, 4], 2.0, 0.0, 0.1)\nassert abs(w - 2.0) < 1e-9 and abs(b - 0.0) < 1e-9' }
          },
          {
            id: "ai-softmax", title: "Softmax", packages: ["numpy"],
            content: `<p><b>Softmax</b> turns a vector of scores into probabilities that sum to 1 (multi-class output):</p>
              <pre><code>e = np.exp(x - x.max())
e / e.sum()</code></pre>`,
            starter: 'import numpy as np\n\ndef softmax(x):\n    # Return the softmax of vector x (probabilities summing to 1)\n    pass\n',
            exercise: { prompt: 'Write <code>softmax(x)</code>.', test: 'import numpy as np\ns = softmax(np.array([1.0, 2, 3]))\nassert abs(s.sum() - 1.0) < 1e-9\nassert s[2] > s[1] > s[0]\nassert np.allclose(softmax(np.array([0.0, 0, 0])), [1/3, 1/3, 1/3])' }
          },
          {
            id: "ai-relu", title: "ReLU Activation", packages: ["numpy"],
            content: `<p>The <b>ReLU</b> activation keeps positives and zeroes out negatives — the workhorse
              nonlinearity in deep nets:</p>
              <pre><code>np.maximum(0, x)</code></pre>`,
            starter: 'import numpy as np\n\ndef relu(x):\n    # Return max(0, x) elementwise\n    pass\n',
            exercise: { prompt: 'Write <code>relu(x)</code>.', test: 'import numpy as np\nassert np.allclose(relu(np.array([-1.0, 0, 2, -3, 5])), [0, 0, 2, 0, 5])' }
          }
        ]
      },
      {
        title: "Applied ML",
        lessons: [
          {
            id: "ai-split", title: "Train/Test Split",
            content: `<p>You evaluate models on data they didn't train on. A simple split takes the first
              fraction for training, the rest for testing:</p>
              <pre><code>k = int(len(items) * train_frac)
items[:k], items[k:]</code></pre>`,
            starter: 'def train_test_split(items, train_frac):\n    # Return (train, test): the first train_frac of items, then the rest\n    pass\n',
            exercise: { prompt: 'Write <code>train_test_split(items, train_frac)</code>.', test: 'tr, te = train_test_split([1,2,3,4,5,6,7,8,9,10], 0.8)\nassert tr == [1,2,3,4,5,6,7,8] and te == [9,10]\ntr, te = train_test_split([1,2,3,4], 0.5)\nassert tr == [1,2] and te == [3,4]' }
          },
          {
            id: "ai-knn", title: "k-Nearest Neighbors", packages: ["numpy"],
            content: `<p>k-NN classifies a point by majority vote of its <code>k</code> closest training points.
              Combine distances, <code>argsort</code>, and a vote.</p>`,
            starter: 'import numpy as np\n\ndef knn_predict(X_train, y_train, x, k):\n    # Return the majority label among the k nearest training points to x\n    pass\n',
            exercise: { prompt: 'Write <code>knn_predict(X_train, y_train, x, k)</code>.', test: 'X = [[0, 0], [0, 1], [10, 10], [10, 11]]; y = [0, 0, 1, 1]\nassert knn_predict(X, y, [0, 0.5], 1) == 0\nassert knn_predict(X, y, [10, 10.5], 3) == 1' }
          },
          {
            id: "ai-confusion", title: "Confusion Matrix",
            content: `<p>For binary classification, count the four outcomes: true/false positives and negatives.</p>
              <pre><code>(tp, fp, fn, tn)</code></pre>`,
            starter: 'def confusion(y_true, y_pred):\n    # Return (tp, fp, fn, tn) for binary labels 0/1\n    pass\n',
            exercise: { prompt: 'Write <code>confusion(y_true, y_pred)</code> returning <code>(tp, fp, fn, tn)</code>.', test: 'assert confusion([1, 1, 0, 0], [1, 0, 1, 0]) == (1, 1, 1, 1)\nassert confusion([1, 1, 1], [1, 1, 1]) == (3, 0, 0, 0)' }
          },
          {
            id: "ai-precision-recall", title: "Precision & Recall",
            content: `<p>From the confusion counts: <b>precision</b> = tp/(tp+fp), <b>recall</b> = tp/(tp+fn).</p>`,
            starter: 'def precision_recall(tp, fp, fn):\n    # Return (precision, recall)\n    pass\n',
            exercise: { prompt: 'Write <code>precision_recall(tp, fp, fn)</code>.', test: 'p, r = precision_recall(8, 2, 0)\nassert abs(p - 0.8) < 1e-9 and abs(r - 1.0) < 1e-9\np, r = precision_recall(5, 0, 5)\nassert p == 1.0 and r == 0.5' }
          },
          {
            id: "ai-sklearn", title: "Logistic Regression (scikit-learn)", packages: ["scikit-learn"],
            content: `<p>scikit-learn gives real models with <code>.fit()</code> / <code>.predict()</code>.
              (First Run loads scikit-learn — a larger download.)</p>
              <pre><code>from sklearn.linear_model import LogisticRegression
LogisticRegression().fit(X, y).predict([[6, 6]])</code></pre>`,
            starter: 'def train_and_predict(X, y, query):\n    # Train LogisticRegression on X, y; return the predicted label (int) for query\n    from sklearn.linear_model import LogisticRegression\n    pass\n',
            exercise: { prompt: 'Write <code>train_and_predict(X, y, query)</code>.', test: 'X = [[0, 0], [0, 1], [1, 0], [5, 5], [5, 6], [6, 5]]; y = [0, 0, 0, 1, 1, 1]\nassert train_and_predict(X, y, [0, 0]) == 0\nassert train_and_predict(X, y, [6, 6]) == 1' }
          },
          {
            id: "ai-kmeans", title: "Clustering (k-means)", packages: ["scikit-learn"],
            content: `<p>k-means groups unlabeled data into <code>k</code> clusters:</p>
              <pre><code>from sklearn.cluster import KMeans
KMeans(n_clusters=2, n_init=10, random_state=0).fit(X).labels_</code></pre>
              <p>(Cluster <i>numbers</i> are arbitrary — what matters is which points share a cluster.)</p>`,
            starter: 'def cluster(X, k):\n    # Return the cluster label for each row of X as a list\n    from sklearn.cluster import KMeans\n    pass\n',
            exercise: { prompt: 'Write <code>cluster(X, k)</code> returning a list of cluster labels.', test: 'X = [[0, 0], [0, 1], [10, 10], [10, 11]]\nlabels = cluster(X, 2)\nassert labels[0] == labels[1]\nassert labels[2] == labels[3]\nassert labels[0] != labels[2]' }
          },
          {
            id: "ai-tree", title: "Decision Tree", packages: ["scikit-learn"],
            content: `<p>A decision tree splits on feature thresholds — easy to interpret:</p>
              <pre><code>from sklearn.tree import DecisionTreeClassifier
DecisionTreeClassifier(random_state=0).fit(X, y).predict([q])</code></pre>`,
            starter: 'def train_and_predict_tree(X, y, query):\n    # Train a DecisionTreeClassifier; return the predicted label (int) for query\n    from sklearn.tree import DecisionTreeClassifier\n    pass\n',
            exercise: { prompt: 'Write <code>train_and_predict_tree(X, y, query)</code>.', test: 'X = [[0, 0], [0, 1], [1, 0], [5, 5], [5, 6], [6, 5]]; y = [0, 0, 0, 1, 1, 1]\nassert train_and_predict_tree(X, y, [0, 0]) == 0\nassert train_and_predict_tree(X, y, [6, 6]) == 1' }
          }
        ]
      },
      {
        title: "Array Operations",
        lessons: [
          { id: "ai-reshape", title: "Reshaping Arrays", packages: ["numpy"],
            content: `<p>Reshape flat data into rows and columns — images and feature batches are reshaped before a model sees them.</p><pre><code>np.arange(6).reshape(2, 3)</code></pre>`,
            starter: 'import numpy as np\n\ndef reshape(arr, rows, cols):\n    # Return arr reshaped to (rows, cols)\n    pass\n',
            exercise: { prompt: 'Write <code>reshape(arr, rows, cols)</code>.', test: 'import numpy as np\nr = reshape(np.arange(6), 2, 3)\nassert r.shape == (2, 3)\nassert np.allclose(r, [[0, 1, 2], [3, 4, 5]])' } },
          { id: "ai-colmeans", title: "Column Means", packages: ["numpy"],
            content: `<p>The mean of each column summarizes every feature at once — the first step of standardizing data.</p><pre><code>X.mean(axis=0)</code></pre>`,
            starter: 'import numpy as np\n\ndef column_means(X):\n    # Return the mean of each column of matrix X\n    pass\n',
            exercise: { prompt: 'Write <code>column_means(X)</code>.', test: 'import numpy as np\nassert np.allclose(column_means(np.array([[1.0, 2], [3, 4]])), [2, 3])' } },
          { id: "ai-argmax", title: "argmax (Predicted Class)", packages: ["numpy"],
            content: `<p>A classifier outputs a probability per class; the prediction is the index of the largest one.</p><pre><code>np.argmax(probs)</code></pre>`,
            starter: 'import numpy as np\n\ndef predict_class(probs):\n    # Return the index of the largest probability (the predicted class)\n    pass\n',
            exercise: { prompt: 'Write <code>predict_class(probs)</code>.', test: 'import numpy as np\nassert predict_class(np.array([0.1, 0.7, 0.2])) == 1\nassert predict_class([5, 1, 2]) == 0' } },
          { id: "ai-clip", title: "Clipping Values", packages: ["numpy"],
            content: `<p>Clipping keeps values in a valid range — probabilities in [0, 1], or capping outliers.</p><pre><code>np.clip(arr, 0, 1)</code></pre>`,
            starter: 'import numpy as np\n\ndef clip01(arr):\n    # Clip every value into the range [0, 1]\n    pass\n',
            exercise: { prompt: 'Write <code>clip01(arr)</code>.', test: 'import numpy as np\nassert np.allclose(clip01(np.array([-0.5, 0.5, 1.5])), [0, 0.5, 1])' } },
          { id: "ai-broadcast", title: "Broadcasting", packages: ["numpy"],
            content: `<p><b>Broadcasting</b> applies a vector across every row without a loop — how a bias is added to a layer.</p><pre><code>X + b</code></pre>`,
            starter: 'import numpy as np\n\ndef add_bias(X, b):\n    # Add the bias vector b to every row of X (broadcasting)\n    pass\n',
            exercise: { prompt: 'Write <code>add_bias(X, b)</code>.', test: 'import numpy as np\nX = np.array([[1.0, 2], [3, 4]]); b = np.array([10.0, 20])\nassert np.allclose(add_bias(X, b), [[11, 22], [13, 24]])' } },
          { id: "ai-l2", title: "L2 Norm", packages: ["numpy"],
            content: `<p>The L2 norm is a vector's length — used in distances, regularization, and normalization.</p><pre><code>np.linalg.norm(v)</code></pre>`,
            starter: 'import numpy as np\n\ndef l2_norm(v):\n    # Return the Euclidean (L2) length of vector v as a float\n    pass\n',
            exercise: { prompt: 'Write <code>l2_norm(v)</code>.', test: 'assert abs(l2_norm([3, 4]) - 5.0) < 1e-9' } },
          { id: "ai-cosine", title: "Cosine Similarity", packages: ["numpy"],
            content: `<p><b>Cosine similarity</b> measures the angle between vectors — the basis of search and recommendation.</p>`,
            starter: 'import numpy as np\n\ndef cosine(a, b):\n    # Return the cosine similarity of vectors a and b\n    pass\n',
            exercise: { prompt: 'Write <code>cosine(a, b)</code>.', test: 'assert abs(cosine([1, 0], [1, 0]) - 1.0) < 1e-9\nassert abs(cosine([1, 0], [0, 1])) < 1e-9' } },
          { id: "ai-classcounts", title: "Counting Classes", packages: ["numpy"],
            content: `<p>Counting how many examples fall in each class tells you whether a dataset is balanced.</p>`,
            starter: 'import numpy as np\n\ndef class_counts(labels):\n    # Return {label: count} for the labels\n    pass\n',
            exercise: { prompt: 'Write <code>class_counts(labels)</code>.', test: 'assert class_counts([0, 0, 1, 1, 1]) == {0: 2, 1: 3}' } }
        ]
      },
      {
        title: "Metrics & Models",
        lessons: [
          { id: "ai-rmse", title: "RMSE", packages: ["numpy"],
            content: `<p><b>RMSE</b> is the square root of MSE, back in the data's original units — a standard regression metric.</p>`,
            starter: 'import numpy as np\n\ndef rmse(y_true, y_pred):\n    # Return the root mean squared error as a float\n    pass\n',
            exercise: { prompt: 'Write <code>rmse(y_true, y_pred)</code>.', test: 'assert abs(rmse([1, 2, 3], [1, 2, 3])) < 1e-9\nassert abs(rmse([0, 0], [3, 4]) - 3.5355339059) < 1e-6' } },
          { id: "ai-r2", title: "R² Score", packages: ["numpy"],
            content: `<p><b>R²</b> is the fraction of variance a model explains: 1 is perfect, 0 is no better than predicting the mean.</p>`,
            starter: 'import numpy as np\n\ndef r2(y_true, y_pred):\n    # Return the R-squared score\n    pass\n',
            exercise: { prompt: 'Write <code>r2(y_true, y_pred)</code>.', test: 'assert abs(r2([1, 2, 3], [1, 2, 3]) - 1.0) < 1e-9\nassert abs(r2([1, 2, 3], [2, 2, 2])) < 1e-9' } },
          { id: "ai-bce", title: "Cross-Entropy Loss", packages: ["numpy"],
            content: `<p><b>Binary cross-entropy</b> is the loss classifiers minimize — it punishes confident wrong answers heavily.</p>`,
            starter: 'import numpy as np\n\ndef bce(y_true, p):\n    # Binary cross-entropy between labels y_true and probabilities p\n    pass\n',
            exercise: { prompt: 'Write <code>bce(y_true, p)</code>.', test: 'assert abs(bce([1], [0.5]) - 0.6931472) < 1e-6\nassert abs(bce([0], [0.5]) - 0.6931472) < 1e-6' } },
          { id: "ai-f1", title: "F1 Score",
            content: `<p>The <b>F1 score</b> balances precision and recall into one number (their harmonic mean).</p><pre><code>2 * p * r / (p + r)</code></pre>`,
            starter: 'def f1(precision, recall):\n    # Return the F1 score (harmonic mean of precision and recall)\n    pass\n',
            exercise: { prompt: 'Write <code>f1(precision, recall)</code>.', test: 'assert abs(f1(1.0, 1.0) - 1.0) < 1e-9\nassert abs(f1(0.5, 0.5) - 0.5) < 1e-9\nassert abs(f1(1.0, 0.5) - (2 * 0.5 / 1.5)) < 1e-9' } },
          { id: "ai-linreg-fit", title: "Fit a Line (scikit-learn)", packages: ["scikit-learn"],
            content: `<p>Fit a line to data with scikit-learn and read off the slope.</p><pre><code>LinearRegression().fit(X, y).coef_</code></pre>`,
            starter: 'def fit_slope(X, y):\n    # Fit LinearRegression and return the slope (first coefficient) as a float\n    from sklearn.linear_model import LinearRegression\n    pass\n',
            exercise: { prompt: 'Write <code>fit_slope(X, y)</code>.', test: 'X = [[0], [1], [2], [3]]; y = [1, 3, 5, 7]\nassert abs(fit_slope(X, y) - 2.0) < 1e-9' } },
          { id: "ai-knn-sklearn", title: "k-NN (scikit-learn)", packages: ["scikit-learn"],
            content: `<p>scikit-learn's k-nearest-neighbors classifier in a few lines.</p>`,
            starter: 'def knn_sklearn(X, y, query, k):\n    # Train KNeighborsClassifier(k) and return the predicted label for query\n    from sklearn.neighbors import KNeighborsClassifier\n    pass\n',
            exercise: { prompt: 'Write <code>knn_sklearn(X, y, query, k)</code>.', test: 'X = [[0, 0], [0, 1], [10, 10], [10, 11]]; y = [0, 0, 1, 1]\nassert knn_sklearn(X, y, [0, 0.5], 1) == 0\nassert knn_sklearn(X, y, [10, 10.5], 3) == 1' } },
          { id: "ai-score", title: "Model Accuracy", packages: ["scikit-learn"],
            content: `<p><code>.score()</code> reports a model's accuracy — here on its own training data.</p>`,
            starter: 'def training_accuracy(X, y):\n    # Train LogisticRegression and return its accuracy on the training data\n    from sklearn.linear_model import LogisticRegression\n    pass\n',
            exercise: { prompt: 'Write <code>training_accuracy(X, y)</code>.', test: 'X = [[0, 0], [0, 1], [5, 5], [5, 6]]; y = [0, 0, 1, 1]\nassert training_accuracy(X, y) == 1.0' } },
          { id: "ai-scale", title: "StandardScaler", packages: ["scikit-learn"],
            content: `<p><b>StandardScaler</b> is the standard preprocessing step: center each feature at 0 with unit variance.</p>`,
            starter: 'def standardize_features(X):\n    # Use StandardScaler to standardize the columns of X (mean 0, std 1)\n    from sklearn.preprocessing import StandardScaler\n    pass\n',
            exercise: { prompt: 'Write <code>standardize_features(X)</code>.', test: 'import numpy as np\nout = standardize_features([[1.0, 10], [2, 20], [3, 30]])\nassert np.allclose(out.mean(axis=0), [0, 0], atol=1e-9)\nassert np.allclose(out.std(axis=0), [1, 1], atol=1e-9)' } }
        ]
      }
    ]
  },

  /* ======================================================================
   * DATA & BIOMEDICAL  (21)
   * ==================================================================== */
  {
    id: "data",
    title: "Data & Biomedical",
    tracks: [
      {
        title: "Data with pandas",
        lessons: [
          {
            id: "data-df", title: "DataFrames", packages: ["pandas"],
            content: `<p>pandas is the workhorse for tabular data (clinical records, CSVs). A <b>DataFrame</b>
              is a table of columns. (First Run loads pandas.)</p>
              <pre><code>pd.DataFrame({"name": ["Ann"], "age": [30]})</code></pre>`,
            starter: 'import pandas as pd\n\ndef make_df(names, ages):\n    # Return a DataFrame with columns "name" and "age"\n    pass\n',
            exercise: { prompt: 'Write <code>make_df(names, ages)</code> with columns <code>name</code> and <code>age</code>.', test: 'import pandas as pd\ndf = make_df(["Ann", "Bob"], [30, 25])\nassert list(df["name"]) == ["Ann", "Bob"]\nassert list(df["age"]) == [30, 25]\nassert df.shape == (2, 2)' }
          },
          {
            id: "data-filter", title: "Filtering Rows", packages: ["pandas"],
            content: `<p>Select rows with a <b>boolean mask</b>:</p>
              <pre><code>df[df["age"] >= 18]</code></pre>`,
            starter: 'import pandas as pd\n\ndef adults(df):\n    # Return only the rows where "age" is >= 18\n    pass\n',
            exercise: { prompt: 'Write <code>adults(df)</code> returning rows where <code>age &gt;= 18</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"name": ["a", "b", "c"], "age": [10, 18, 40]})\nout = adults(df)\nassert list(out["name"]) == ["b", "c"]\nassert len(out) == 2' }
          },
          {
            id: "data-agg", title: "Grouping & Aggregation", packages: ["pandas"],
            content: `<p><code>groupby</code> summarizes each group — e.g. average value per cohort:</p>
              <pre><code>df.groupby("group")["value"].mean()</code></pre>`,
            starter: 'import pandas as pd\n\ndef mean_by_group(df):\n    # Return {group: mean value} for columns "group" and "value"\n    pass\n',
            exercise: { prompt: 'Write <code>mean_by_group(df)</code> returning a dict of group → mean.', test: 'import pandas as pd\ndf = pd.DataFrame({"group": ["x", "x", "y"], "value": [2.0, 4.0, 10.0]})\nres = mean_by_group(df)\nassert res["x"] == 3.0\nassert res["y"] == 10.0' }
          },
          {
            id: "data-sort", title: "Sorting & Top-N", packages: ["pandas"],
            content: `<p>Rank rows with <code>sort_values</code> and take the head:</p>
              <pre><code>df.sort_values("score", ascending=False).head(n)</code></pre>`,
            starter: 'import pandas as pd\n\ndef top_n(df, col, n):\n    # Return the n rows with the largest values in column col\n    pass\n',
            exercise: { prompt: 'Write <code>top_n(df, col, n)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"name": ["a", "b", "c"], "score": [5, 9, 1]})\nout = top_n(df, "score", 2)\nassert list(out["name"]) == ["b", "a"]\nassert len(out) == 2' }
          },
          {
            id: "data-missing", title: "Missing Data", packages: ["pandas", "numpy"],
            content: `<p>Real datasets have gaps (<code>NaN</code>). Fill them with <code>fillna</code>:</p>
              <pre><code>df[col] = df[col].fillna(value)</code></pre>`,
            starter: 'import pandas as pd\n\ndef fill_missing(df, col, value):\n    # Return a copy of df with NaNs in column col replaced by value\n    pass\n',
            exercise: { prompt: 'Write <code>fill_missing(df, col, value)</code>.', test: 'import pandas as pd, numpy as np\ndf = pd.DataFrame({"x": [1.0, np.nan, 3.0]})\nout = fill_missing(df, "x", 0)\nassert list(out["x"]) == [1.0, 0.0, 3.0]' }
          },
          {
            id: "data-newcol", title: "Computed Columns", packages: ["pandas"],
            content: `<p>Derive new columns from existing ones — e.g. BMI from weight and height:</p>
              <pre><code>df["bmi"] = df["weight"] / df["height"] ** 2</code></pre>`,
            starter: 'import pandas as pd\n\ndef add_bmi(df):\n    # Return a copy of df with a new "bmi" column = weight / height**2\n    pass\n',
            exercise: { prompt: 'Write <code>add_bmi(df)</code> adding a <code>bmi</code> column.', test: 'import pandas as pd\ndf = pd.DataFrame({"weight": [70.0], "height": [1.75]})\nout = add_bmi(df)\nassert abs(out["bmi"].iloc[0] - 22.857142857) < 1e-6' }
          },
          {
            id: "data-count", title: "Value Counts", packages: ["pandas"],
            content: `<p>Tally how often each category appears:</p>
              <pre><code>df[col].value_counts().to_dict()</code></pre>`,
            starter: 'import pandas as pd\n\ndef category_counts(df, col):\n    # Return {category: count} for column col\n    pass\n',
            exercise: { prompt: 'Write <code>category_counts(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"grp": ["a", "a", "b"]})\nassert category_counts(df, "grp") == {"a": 2, "b": 1}' }
          }
        ]
      },
      {
        title: "Statistics (NumPy)",
        lessons: [
          {
            id: "stat-summary", title: "Mean & Median", packages: ["numpy"],
            content: `<p>Two ways to describe a "typical" value:</p>
              <pre><code>arr.mean(), np.median(arr)</code></pre>`,
            starter: 'import numpy as np\n\ndef summary(arr):\n    # Return (mean, median) as floats\n    pass\n',
            exercise: { prompt: 'Write <code>summary(arr)</code> returning <code>(mean, median)</code>.', test: 'm, med = summary([1, 2, 3, 4])\nassert m == 2.5 and med == 2.5\nm, med = summary([1, 2, 3, 4, 5])\nassert m == 3.0 and med == 3.0' }
          },
          {
            id: "stat-std", title: "Standard Deviation", packages: ["numpy"],
            content: `<p>Spread of the data. Use the <b>sample</b> std (<code>ddof=1</code>):</p>
              <pre><code>np.std(arr, ddof=1)</code></pre>`,
            starter: 'import numpy as np\n\ndef std(arr):\n    # Return the sample standard deviation (ddof=1) as a float\n    pass\n',
            exercise: { prompt: 'Write <code>std(arr)</code> (sample standard deviation).', test: 'assert abs(std([2, 4, 4, 4, 5, 5, 7, 9]) - 2.138089935) < 1e-6\nassert std([5, 5, 5]) == 0.0' }
          },
          {
            id: "stat-quartiles", title: "Quartiles", packages: ["numpy"],
            content: `<p>Quartiles split data into four parts — the basis of box plots:</p>
              <pre><code>np.percentile(arr, [25, 50, 75])</code></pre>`,
            starter: 'import numpy as np\n\ndef quartiles(arr):\n    # Return (Q1, median, Q3) as floats\n    pass\n',
            exercise: { prompt: 'Write <code>quartiles(arr)</code> returning <code>(Q1, median, Q3)</code>.', test: 'q1, q2, q3 = quartiles([1, 2, 3, 4, 5, 6, 7, 8])\nassert abs(q1 - 2.75) < 1e-9 and abs(q2 - 4.5) < 1e-9 and abs(q3 - 6.25) < 1e-9' }
          },
          {
            id: "stat-correlation", title: "Correlation", packages: ["numpy"],
            content: `<p>Pearson correlation measures linear relationship, from -1 to 1:</p>
              <pre><code>np.corrcoef(x, y)[0, 1]</code></pre>`,
            starter: 'import numpy as np\n\ndef correlation(x, y):\n    # Return the Pearson correlation coefficient as a float\n    pass\n',
            exercise: { prompt: 'Write <code>correlation(x, y)</code>.', test: 'assert abs(correlation([1, 2, 3], [2, 4, 6]) - 1.0) < 1e-9\nassert abs(correlation([1, 2, 3], [6, 4, 2]) + 1.0) < 1e-9' }
          },
          {
            id: "stat-outliers", title: "Outlier Detection", packages: ["numpy"],
            content: `<p>Flag values far from the mean using the <b>z-score</b>:</p>
              <pre><code>z = (arr - arr.mean()) / arr.std()   # |z| > threshold -> outlier</code></pre>`,
            starter: 'import numpy as np\n\ndef outliers(arr, thresh):\n    # Return the indices where |z-score| > thresh\n    pass\n',
            exercise: { prompt: 'Write <code>outliers(arr, thresh)</code> returning a list of indices.', test: 'assert outliers([10, 11, 12, 10, 100], 1.5) == [4]' }
          },
          {
            id: "stat-probabilities", title: "Counts to Probabilities", packages: ["numpy"],
            content: `<p>Normalize counts into a probability distribution (sums to 1):</p>
              <pre><code>a = np.array(counts, float);  a / a.sum()</code></pre>`,
            starter: 'import numpy as np\n\ndef to_probabilities(counts):\n    # Return counts normalized to sum to 1\n    pass\n',
            exercise: { prompt: 'Write <code>to_probabilities(counts)</code>.', test: 'import numpy as np\np = to_probabilities([1, 1, 2])\nassert np.allclose(p, [0.25, 0.25, 0.5])\nassert abs(p.sum() - 1.0) < 1e-9' }
          },
          {
            id: "stat-linreg", title: "Linear Regression", packages: ["numpy"],
            content: `<p>Fit a straight line (slope, intercept) by least squares:</p>
              <pre><code>np.polyfit(x, y, 1)   # -> [slope, intercept]</code></pre>`,
            starter: 'import numpy as np\n\ndef linreg(x, y):\n    # Return (slope, intercept) of the best-fit line\n    pass\n',
            exercise: { prompt: 'Write <code>linreg(x, y)</code> returning <code>(slope, intercept)</code>.', test: 's, b = linreg([0, 1, 2, 3], [1, 3, 5, 7])\nassert abs(s - 2.0) < 1e-9 and abs(b - 1.0) < 1e-9' }
          }
        ]
      },
      {
        title: "Bioinformatics",
        lessons: [
          {
            id: "bio-bmi", title: "BMI & Clinical Categories",
            content: `<p><code>BMI = weight_kg / height_m²</code>. WHO categories: &lt;18.5 Underweight,
              &lt;25 Normal, &lt;30 Overweight, else Obese.</p>`,
            starter: 'def bmi_category(weight_kg, height_m):\n    # Return "Underweight" / "Normal" / "Overweight" / "Obese"\n    pass\n',
            exercise: { prompt: 'Write <code>bmi_category(weight_kg, height_m)</code>.', test: 'assert bmi_category(50, 1.75) == "Underweight"\nassert bmi_category(70, 1.75) == "Normal"\nassert bmi_category(80, 1.75) == "Overweight"\nassert bmi_category(95, 1.75) == "Obese"' }
          },
          {
            id: "bio-gc", title: "DNA: GC Content",
            content: `<p><b>GC content</b> is the fraction of a DNA sequence that is G or C:</p>
              <pre><code>(seq.count("G") + seq.count("C")) / len(seq)</code></pre>`,
            starter: 'def gc_content(seq):\n    # Return the fraction of the sequence that is G or C (case-insensitive)\n    pass\n',
            exercise: { prompt: 'Write <code>gc_content(seq)</code>.', test: 'assert abs(gc_content("GGCC") - 1.0) < 1e-9\nassert abs(gc_content("ATAT")) < 1e-9\nassert abs(gc_content("AtGc") - 0.5) < 1e-9' }
          },
          {
            id: "bio-complement", title: "DNA: Complement",
            content: `<p>A pairs with T, G with C. The <b>complement</b> swaps each base:
              <code>ATGC → TACG</code>.</p>`,
            starter: 'def complement(seq):\n    # Return the complement strand, uppercase (A<->T, G<->C)\n    pass\n',
            exercise: { prompt: 'Write <code>complement(seq)</code> (uppercase).', test: 'assert complement("ATGC") == "TACG"\nassert complement("aatt") == "TTAA"\nassert complement("GGGG") == "CCCC"' }
          },
          {
            id: "bio-revcomp", title: "Reverse Complement",
            content: `<p>The strand that pairs with DNA runs in the opposite direction, so it's the
              complement <i>reversed</i>: <code>ATGC → GCAT</code>. This is the most-used operation in
              genomics.</p>`,
            starter: 'def reverse_complement(seq):\n    # Return the reverse complement, uppercase\n    pass\n',
            exercise: { prompt: 'Write <code>reverse_complement(seq)</code>.', test: 'assert reverse_complement("ATGC") == "GCAT"\nassert reverse_complement("AAAA") == "TTTT"' }
          },
          {
            id: "bio-transcribe", title: "Transcription (DNA → RNA)",
            content: `<p>Transcription copies DNA to RNA, replacing T with U:</p>
              <pre><code>"ATGC" -> "AUGC"</code></pre>`,
            starter: 'def transcribe(seq):\n    # Return the RNA transcript (uppercase): replace T with U\n    pass\n',
            exercise: { prompt: 'Write <code>transcribe(seq)</code>.', test: 'assert transcribe("ATGC") == "AUGC"\nassert transcribe("TTTT") == "UUUU"' }
          },
          {
            id: "bio-findstart", title: "Finding the Start Codon",
            content: `<p>Genes begin at the start codon <code>ATG</code>. Find its first position (or -1):</p>
              <pre><code>seq.upper().find("ATG")</code></pre>`,
            starter: 'def find_start_codon(seq):\n    # Return the index of the first "ATG", or -1 if absent\n    pass\n',
            exercise: { prompt: 'Write <code>find_start_codon(seq)</code>.', test: 'assert find_start_codon("GGATGCC") == 2\nassert find_start_codon("AAAA") == -1' }
          },
          {
            id: "bio-hamming", title: "Hamming Distance (Mutations)",
            content: `<p>The <b>Hamming distance</b> counts positions where two equal-length sequences differ —
              a simple mutation count:</p>
              <pre><code>sum(x != y for x, y in zip(a, b))</code></pre>`,
            starter: 'def hamming(a, b):\n    # Return the number of positions where a and b differ (same length)\n    pass\n',
            exercise: { prompt: 'Write <code>hamming(a, b)</code>.', test: 'assert hamming("GAGCCTACTAACGGGAT", "CATCGTAATGACGGCCT") == 7\nassert hamming("AAAA", "AAAA") == 0' }
          }
        ]
      },
      {
        title: "More pandas",
        lessons: [
          { id: "data-rename", title: "Renaming Columns", packages: ["pandas"],
            content: `<p>Rename a column to something clearer.</p><pre><code>df.rename(columns={"old": "new"})</code></pre>`,
            starter: 'import pandas as pd\n\ndef rename_col(df, old, new):\n    # Return df with column "old" renamed to "new"\n    pass\n',
            exercise: { prompt: 'Write <code>rename_col(df, old, new)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"a": [1], "b": [2]})\nout = rename_col(df, "a", "x")\nassert list(out.columns) == ["x", "b"]' } },
          { id: "data-dropna", title: "Dropping Missing Rows", packages: ["pandas", "numpy"],
            content: `<p>Drop rows that contain any missing value.</p><pre><code>df.dropna()</code></pre>`,
            starter: 'import pandas as pd\n\ndef drop_missing(df):\n    # Return df with rows containing NaN removed\n    pass\n',
            exercise: { prompt: 'Write <code>drop_missing(df)</code>.', test: 'import pandas as pd, numpy as np\ndf = pd.DataFrame({"x": [1.0, np.nan, 3.0]})\nout = drop_missing(df)\nassert len(out) == 2\nassert list(out["x"]) == [1.0, 3.0]' } },
          { id: "data-sum-col", title: "Column Total", packages: ["pandas"],
            content: `<p>Add up all the values in a column.</p><pre><code>df[col].sum()</code></pre>`,
            starter: 'import pandas as pd\n\ndef column_sum(df, col):\n    # Return the sum of column col as a float\n    pass\n',
            exercise: { prompt: 'Write <code>column_sum(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"v": [1, 2, 3]})\nassert column_sum(df, "v") == 6.0' } },
          { id: "data-double", title: "Transform a Column", packages: ["pandas"],
            content: `<p>Apply arithmetic to a whole column at once (vectorized).</p><pre><code>df[col] = df[col] * 2</code></pre>`,
            starter: 'import pandas as pd\n\ndef double_col(df, col):\n    # Return a copy of df with column col doubled\n    pass\n',
            exercise: { prompt: 'Write <code>double_col(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"v": [1, 2, 3]})\nout = double_col(df, "v")\nassert list(out["v"]) == [2, 4, 6]' } },
          { id: "data-merge", title: "Joining Tables", packages: ["pandas"],
            content: `<p><b>Merging</b> combines two tables on a shared key — like a database join.</p><pre><code>a.merge(b, on="id")</code></pre>`,
            starter: 'import pandas as pd\n\ndef merge_on(a, b, key):\n    # Return a and b merged on the shared column key\n    pass\n',
            exercise: { prompt: 'Write <code>merge_on(a, b, key)</code>.', test: 'import pandas as pd\na = pd.DataFrame({"id": [1, 2], "name": ["x", "y"]}); b = pd.DataFrame({"id": [1, 2], "age": [10, 20]})\nout = merge_on(a, b, "id")\nassert list(out.columns) == ["id", "name", "age"]\nassert list(out["age"]) == [10, 20]' } },
          { id: "data-highest", title: "Row with the Max", packages: ["pandas"],
            content: `<p>Find the label for the largest value — <code>idxmax</code> gives its row.</p><pre><code>df.loc[df[col].idxmax(), "name"]</code></pre>`,
            starter: 'import pandas as pd\n\ndef highest(df, col):\n    # Return the "name" of the row with the largest value in column col\n    pass\n',
            exercise: { prompt: 'Write <code>highest(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"name": ["a", "b", "c"], "score": [5, 9, 1]})\nassert highest(df, "score") == "b"' } },
          { id: "data-distinct", title: "Distinct Values", packages: ["pandas"],
            content: `<p>List the unique values in a column, sorted.</p><pre><code>df[col].unique()</code></pre>`,
            starter: 'import pandas as pd\n\ndef distinct(df, col):\n    # Return the sorted list of distinct values in column col\n    pass\n',
            exercise: { prompt: 'Write <code>distinct(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"g": ["b", "a", "a", "b"]})\nassert distinct(df, "g") == ["a", "b"]' } },
          { id: "data-groupsize", title: "Group Sizes", packages: ["pandas"],
            content: `<p>Count how many rows fall in each group.</p><pre><code>df.groupby(col).size()</code></pre>`,
            starter: 'import pandas as pd\n\ndef group_sizes(df, col):\n    # Return {group: number of rows} for column col\n    pass\n',
            exercise: { prompt: 'Write <code>group_sizes(df, col)</code>.', test: 'import pandas as pd\ndf = pd.DataFrame({"g": ["a", "a", "b"]})\nassert group_sizes(df, "g") == {"a": 2, "b": 1}' } }
        ]
      },
      {
        title: "More Statistics",
        lessons: [
          { id: "stat-variance", title: "Variance", packages: ["numpy"],
            content: `<p><b>Variance</b> is the average squared distance from the mean — standard deviation squared.</p><pre><code>np.var(arr, ddof=1)</code></pre>`,
            starter: 'import numpy as np\n\ndef variance(arr):\n    # Return the sample variance (ddof=1) as a float\n    pass\n',
            exercise: { prompt: 'Write <code>variance(arr)</code>.', test: 'assert abs(variance([2, 4, 4, 4, 5, 5, 7, 9]) - 4.571428571) < 1e-6\nassert variance([5, 5, 5]) == 0.0' } },
          { id: "stat-range", title: "Range", packages: [],
            content: `<p>The <b>range</b> is the spread between the largest and smallest values.</p>`,
            starter: 'def data_range(arr):\n    # Return max(arr) - min(arr) as a float\n    pass\n',
            exercise: { prompt: 'Write <code>data_range(arr)</code>.', test: 'assert data_range([3, 1, 4, 1, 5]) == 4.0\nassert data_range([7]) == 0.0' } },
          { id: "stat-mode", title: "Mode", packages: [],
            content: `<p>The <b>mode</b> is the most frequent value — the third "average" alongside mean and median.</p>`,
            starter: 'def mode(arr):\n    # Return the most common value in arr\n    pass\n',
            exercise: { prompt: 'Write <code>mode(arr)</code>.', test: 'assert mode([1, 2, 2, 3, 2]) == 2\nassert mode(["a", "b", "a"]) == "a"' } },
          { id: "stat-iqr", title: "Interquartile Range", packages: ["numpy"],
            content: `<p>The <b>IQR</b> (Q3 − Q1) measures the spread of the middle 50% — robust to outliers.</p>`,
            starter: 'import numpy as np\n\ndef iqr(arr):\n    # Return the interquartile range (75th percentile minus 25th)\n    pass\n',
            exercise: { prompt: 'Write <code>iqr(arr)</code>.', test: 'assert abs(iqr([1, 2, 3, 4, 5, 6, 7, 8]) - 3.5) < 1e-9' } },
          { id: "stat-covariance", title: "Covariance", packages: ["numpy"],
            content: `<p><b>Covariance</b> measures how two variables vary together (positive = move the same way).</p><pre><code>np.cov(x, y, ddof=1)[0, 1]</code></pre>`,
            starter: 'import numpy as np\n\ndef covariance(x, y):\n    # Return the sample covariance of x and y\n    pass\n',
            exercise: { prompt: 'Write <code>covariance(x, y)</code>.', test: 'assert abs(covariance([1, 2, 3], [2, 4, 6]) - 2.0) < 1e-9' } },
          { id: "stat-cumsum", title: "Cumulative Sum", packages: ["numpy"],
            content: `<p>A <b>cumulative sum</b> is the running total — the basis of area-under-curve and progress charts.</p><pre><code>np.cumsum(arr)</code></pre>`,
            starter: 'import numpy as np\n\ndef cumulative(arr):\n    # Return the running totals of arr as a plain list\n    pass\n',
            exercise: { prompt: 'Write <code>cumulative(arr)</code>.', test: 'assert cumulative([1, 2, 3]) == [1, 3, 6]\nassert cumulative([]) == []' } },
          { id: "stat-percentile", title: "Percentiles", packages: ["numpy"],
            content: `<p>A <b>percentile</b> is the value below which a given percent of data falls (the 50th is the median).</p><pre><code>np.percentile(arr, p)</code></pre>`,
            starter: 'import numpy as np\n\ndef percentile(arr, p):\n    # Return the p-th percentile of arr\n    pass\n',
            exercise: { prompt: 'Write <code>percentile(arr, p)</code>.', test: 'assert percentile([1, 2, 3, 4], 50) == 2.5\nassert percentile([1, 2, 3, 4, 5], 100) == 5.0' } },
          { id: "stat-weighted-mean", title: "Weighted Mean", packages: ["numpy"],
            content: `<p>A <b>weighted mean</b> counts some values more than others — used for grades, ratings, and portfolios.</p><pre><code>np.average(values, weights=weights)</code></pre>`,
            starter: 'import numpy as np\n\ndef weighted_mean(values, weights):\n    # Return the weighted mean of values\n    pass\n',
            exercise: { prompt: 'Write <code>weighted_mean(values, weights)</code>.', test: 'assert weighted_mean([1, 2, 3], [1, 1, 1]) == 2.0\nassert abs(weighted_mean([1, 2, 3], [0, 0, 1]) - 3.0) < 1e-9\nassert weighted_mean([10, 20], [1, 3]) == 17.5' } }
        ]
      }
    ]
  },

  /* ======================================================================
   * PROJECT MANAGEMENT  (21)
   * ==================================================================== */
  {
    id: "pm",
    title: "Project Management",
    tracks: [
      {
        title: "Planning & Scheduling",
        lessons: [
          {
            id: "pm-duration", title: "Modeling Tasks",
            content: `<p>Represent a plan as a list of task dicts, then compute totals:</p>
              <pre><code>sum(t["duration"] for t in tasks)</code></pre>`,
            starter: 'def total_duration(tasks):\n    # Sum the "duration" of every task (0 for an empty list)\n    pass\n',
            exercise: { prompt: 'Write <code>total_duration(tasks)</code>.', test: 'tasks = [{"name": "a", "duration": 3}, {"name": "b", "duration": 5}]\nassert total_duration(tasks) == 8\nassert total_duration([]) == 0' }
          },
          {
            id: "pm-dates", title: "Working with Dates",
            content: `<p>Python's <code>datetime</code> subtracts dates to give a duration:</p>
              <pre><code>(date(2024, 1, 11) - date(2024, 1, 1)).days   # 10</code></pre>`,
            starter: 'from datetime import date\n\ndef days_between(start, end):\n    # Return the number of days from start to end (date objects)\n    pass\n',
            exercise: { prompt: 'Write <code>days_between(start, end)</code>.', test: 'from datetime import date\nassert days_between(date(2024, 1, 1), date(2024, 1, 11)) == 10\nassert days_between(date(2024, 3, 1), date(2024, 3, 1)) == 0\nassert days_between(date(2024, 1, 1), date(2024, 2, 1)) == 31' }
          },
          {
            id: "pm-critical", title: "Earliest Finish (Dependencies)",
            content: `<p>A task can't start until its dependencies finish. Its <b>earliest finish</b> is
              <code>max(finish of deps) + duration</code> — the idea behind critical-path scheduling.
              A recursive helper with memoization handles the graph.</p>`,
            starter: 'def earliest_finish(tasks):\n    # tasks: { id: {"duration": int, "deps": [ids...]} }\n    # Return { id: earliest finish time }. No-dep tasks start at 0.\n    pass\n',
            exercise: { prompt: 'Write <code>earliest_finish(tasks)</code>.', test: 'tasks = {\n  "A": {"duration": 3, "deps": []},\n  "B": {"duration": 2, "deps": ["A"]},\n  "C": {"duration": 4, "deps": ["A"]},\n  "D": {"duration": 1, "deps": ["B", "C"]},\n}\nf = earliest_finish(tasks)\nassert f["A"] == 3\nassert f["B"] == 5\nassert f["C"] == 7\nassert f["D"] == 8' }
          },
          {
            id: "pm-projdur", title: "Total Project Duration",
            content: `<p>The whole project finishes when its last task finishes — the maximum earliest
              finish across all tasks (the critical path length).</p>`,
            starter: 'def project_duration(tasks):\n    # Return the project completion time: max earliest-finish over all tasks.\n    # tasks: { id: {"duration": int, "deps": [ids...]} }\n    pass\n',
            exercise: { prompt: 'Write <code>project_duration(tasks)</code>.', test: 'tasks = {\n  "A": {"duration": 3, "deps": []},\n  "B": {"duration": 2, "deps": ["A"]},\n  "C": {"duration": 4, "deps": ["A"]},\n  "D": {"duration": 1, "deps": ["B", "C"]},\n}\nassert project_duration(tasks) == 8\nassert project_duration({"X": {"duration": 5, "deps": []}}) == 5' }
          },
          {
            id: "pm-milestones", title: "Milestones",
            content: `<p>Milestones are zero-duration checkpoints. Pull the ones flagged as milestones:</p>
              <pre><code>[t["name"] for t in tasks if t.get("milestone")]</code></pre>`,
            starter: 'def milestones(tasks):\n    # Return the names of tasks whose "milestone" key is truthy, in order\n    pass\n',
            exercise: { prompt: 'Write <code>milestones(tasks)</code>.', test: 'tasks = [{"name": "kickoff", "milestone": True}, {"name": "work", "milestone": False}, {"name": "launch", "milestone": True}]\nassert milestones(tasks) == ["kickoff", "launch"]' }
          },
          {
            id: "pm-percent", title: "Percent Complete",
            content: `<p>Overall progress is best weighted by task size:</p>
              <pre><code>sum(duration * percent) / sum(duration)</code></pre>`,
            starter: 'def percent_complete(tasks):\n    # Duration-weighted average of each task\'s "percent" (0..1)\n    pass\n',
            exercise: { prompt: 'Write <code>percent_complete(tasks)</code>.', test: 'assert percent_complete([{"duration": 10, "percent": 1.0}, {"duration": 10, "percent": 0.0}]) == 0.5\nassert percent_complete([{"duration": 4, "percent": 0.5}, {"duration": 4, "percent": 0.5}]) == 0.5' }
          },
          {
            id: "pm-workdays", title: "Counting Work Days",
            content: `<p>Schedules skip weekends. Count weekdays (Mon–Fri) in a date range —
              <code>weekday()</code> is 0–4 for Mon–Fri:</p>
              <pre><code>d.weekday() < 5</code></pre>`,
            starter: 'from datetime import date, timedelta\n\ndef workdays(start, end):\n    # Count weekdays (Mon-Fri) from start (inclusive) up to end (exclusive)\n    pass\n',
            exercise: { prompt: 'Write <code>workdays(start, end)</code>.', test: 'from datetime import date\nassert workdays(date(2024, 1, 1), date(2024, 1, 8)) == 5\nassert workdays(date(2024, 1, 1), date(2024, 1, 1)) == 0' }
          }
        ]
      },
      {
        title: "Cost & Earned Value",
        lessons: [
          {
            id: "pm-budget", title: "Budget Tracking",
            content: `<p>Flag line items where actual cost beat the plan:</p>
              <pre><code>[i["name"] for i in items if i["actual"] > i["planned"]]</code></pre>`,
            starter: 'def over_budget_items(items):\n    # Return the names of items whose "actual" exceeds "planned", in order\n    pass\n',
            exercise: { prompt: 'Write <code>over_budget_items(items)</code>.', test: 'items = [\n  {"name": "design", "planned": 100, "actual": 120},\n  {"name": "dev", "planned": 500, "actual": 450},\n  {"name": "qa", "planned": 100, "actual": 100},\n]\nassert over_budget_items(items) == ["design"]' }
          },
          {
            id: "pm-totalcost", title: "Total Cost",
            content: `<p>Roll up actual costs across all items:</p>
              <pre><code>sum(i["actual"] for i in items)</code></pre>`,
            starter: 'def total_cost(items):\n    # Sum the "actual" cost of every item (0 for empty)\n    pass\n',
            exercise: { prompt: 'Write <code>total_cost(items)</code>.', test: 'assert total_cost([{"actual": 100}, {"actual": 250}]) == 350\nassert total_cost([]) == 0' }
          },
          {
            id: "pm-variance", title: "Cost Variance",
            content: `<p>Variance = planned − actual (positive means under budget):</p>`,
            starter: 'def total_variance(items):\n    # Return sum(planned) - sum(actual) across items\n    pass\n',
            exercise: { prompt: 'Write <code>total_variance(items)</code>.', test: 'items = [{"planned": 100, "actual": 120}, {"planned": 200, "actual": 150}]\nassert total_variance(items) == 30' }
          },
          {
            id: "pm-cpi", title: "Earned Value: CPI",
            content: `<p>The <b>Cost Performance Index</b> is earned value ÷ actual cost. Above 1.0 is good
              (getting more value per dollar):</p>
              <pre><code>CPI = EV / AC</code></pre>`,
            starter: 'def cpi(earned_value, actual_cost):\n    # Return the Cost Performance Index = EV / AC\n    pass\n',
            exercise: { prompt: 'Write <code>cpi(earned_value, actual_cost)</code>.', test: 'assert cpi(100, 80) == 1.25\nassert cpi(80, 100) == 0.8' }
          },
          {
            id: "pm-spi", title: "Earned Value: SPI",
            content: `<p>The <b>Schedule Performance Index</b> is earned value ÷ planned value. Above 1.0 means
              ahead of schedule:</p>
              <pre><code>SPI = EV / PV</code></pre>`,
            starter: 'def spi(earned_value, planned_value):\n    # Return the Schedule Performance Index = EV / PV\n    pass\n',
            exercise: { prompt: 'Write <code>spi(earned_value, planned_value)</code>.', test: 'assert spi(90, 100) == 0.9\nassert spi(120, 100) == 1.2' }
          },
          {
            id: "pm-burn", title: "Burn Rate",
            content: `<p>Average spend per period tells you how fast the budget is going:</p>
              <pre><code>sum(spends) / len(spends)</code></pre>`,
            starter: 'def burn_rate(spends):\n    # Return the average spend per period\n    pass\n',
            exercise: { prompt: 'Write <code>burn_rate(spends)</code>.', test: 'assert burn_rate([100, 200, 300]) == 200.0\nassert burn_rate([50]) == 50.0' }
          },
          {
            id: "pm-eac", title: "Estimate at Completion",
            content: `<p>Forecast the final cost from performance so far: <b>EAC</b> = budget ÷ CPI. A CPI below 1.0
              forecasts an overrun.</p>`,
            starter: 'def eac(budget, cpi_value):\n    # Return the Estimate At Completion = budget / cpi_value\n    pass\n',
            exercise: { prompt: 'Write <code>eac(budget, cpi_value)</code>.', test: 'assert eac(1000, 1.25) == 800.0\nassert eac(1000, 0.8) == 1250.0' }
          }
        ]
      },
      {
        title: "Risk & Resources",
        lessons: [
          {
            id: "pm-risk", title: "Risk Levels",
            content: `<p>Bucket a risk from probability × impact (each 0–1): &lt;0.2 Low, &lt;0.5 Medium, else High.</p>`,
            starter: 'def risk_level(prob, impact):\n    # score = prob * impact; return "Low" / "Medium" / "High"\n    pass\n',
            exercise: { prompt: 'Write <code>risk_level(prob, impact)</code>.', test: 'assert risk_level(0.2, 0.2) == "Low"\nassert risk_level(0.5, 0.5) == "Medium"\nassert risk_level(0.9, 0.9) == "High"\nassert risk_level(1.0, 0.5) == "High"' }
          },
          {
            id: "pm-riskscore", title: "Risk Score",
            content: `<p>The raw numeric score is simply probability × impact:</p>`,
            starter: 'def risk_score(prob, impact):\n    # Return prob * impact\n    pass\n',
            exercise: { prompt: 'Write <code>risk_score(prob, impact)</code>.', test: 'assert abs(risk_score(0.5, 0.4) - 0.2) < 1e-9\nassert risk_score(1.0, 1.0) == 1.0' }
          },
          {
            id: "pm-toprisks", title: "Top Risks",
            content: `<p>Rank risks by score and take the worst few — sort with a key:</p>
              <pre><code>sorted(risks, key=lambda r: r["prob"] * r["impact"], reverse=True)</code></pre>`,
            starter: 'def top_risks(risks, n):\n    # Return the names of the n highest prob*impact risks, worst first\n    pass\n',
            exercise: { prompt: 'Write <code>top_risks(risks, n)</code>.', test: 'risks = [{"name": "a", "prob": 0.1, "impact": 0.1}, {"name": "b", "prob": 0.9, "impact": 0.9}, {"name": "c", "prob": 0.5, "impact": 0.5}]\nassert top_risks(risks, 2) == ["b", "c"]' }
          },
          {
            id: "pm-emv", title: "Expected Monetary Value",
            content: `<p><b>EMV</b> sums probability × cost across risks — the expected budget hit to reserve for:</p>
              <pre><code>sum(r["prob"] * r["cost"] for r in risks)</code></pre>`,
            starter: 'def emv(risks):\n    # Return the total expected monetary value = sum(prob * cost)\n    pass\n',
            exercise: { prompt: 'Write <code>emv(risks)</code>.', test: 'assert emv([{"prob": 0.5, "cost": 1000}, {"prob": 0.1, "cost": 5000}]) == 1000.0' }
          },
          {
            id: "pm-util", title: "Resource Utilization",
            content: `<p>Utilization is allocated ÷ capacity. Above 1.0 means overloaded:</p>`,
            starter: 'def utilization(allocated, capacity):\n    # Return allocated / capacity\n    pass\n',
            exercise: { prompt: 'Write <code>utilization(allocated, capacity)</code>.', test: 'assert utilization(30, 40) == 0.75\nassert utilization(40, 40) == 1.0' }
          },
          {
            id: "pm-overalloc", title: "Overallocated People",
            content: `<p>Find team members assigned beyond their capacity:</p>
              <pre><code>[p["name"] for p in people if p["allocated"] > p["capacity"]]</code></pre>`,
            starter: 'def overallocated(people):\n    # Return the names of people whose "allocated" exceeds "capacity"\n    pass\n',
            exercise: { prompt: 'Write <code>overallocated(people)</code>.', test: 'people = [{"name": "ann", "allocated": 45, "capacity": 40}, {"name": "bob", "allocated": 30, "capacity": 40}]\nassert overallocated(people) == ["ann"]' }
          },
          {
            id: "pm-quadrant", title: "Priority Matrix",
            content: `<p>The Eisenhower matrix sorts work by urgency and importance:</p>
              <ul><li>urgent + important → Do</li><li>important only → Schedule</li>
              <li>urgent only → Delegate</li><li>neither → Delete</li></ul>`,
            starter: 'def quadrant(urgent, important):\n    # Return "Do" / "Schedule" / "Delegate" / "Delete"\n    pass\n',
            exercise: { prompt: 'Write <code>quadrant(urgent, important)</code>.', test: 'assert quadrant(True, True) == "Do"\nassert quadrant(False, True) == "Schedule"\nassert quadrant(True, False) == "Delegate"\nassert quadrant(False, False) == "Delete"' }
          }
        ]
      },
      {
        title: "Scheduling & Estimation",
        lessons: [
          { id: "pm-pert", title: "PERT Estimate",
            content: `<p>A <b>PERT</b> estimate blends optimistic, most-likely, and pessimistic guesses, weighting the middle:</p><pre><code>(O + 4*M + P) / 6</code></pre>`,
            starter: 'def pert(o, m, p):\n    # Return the PERT estimate for optimistic o, most-likely m, pessimistic p\n    pass\n',
            exercise: { prompt: 'Write <code>pert(o, m, p)</code>.', test: 'assert pert(2, 4, 6) == 4.0\nassert pert(1, 2, 9) == 3.0' } },
          { id: "pm-slack", title: "Slack (Float)",
            content: `<p><b>Slack</b> (float) is how long a task can slip without delaying the project — the gap between its earliest and latest start.</p>`,
            starter: 'def slack(early_start, late_start):\n    # Return the slack (late_start - early_start)\n    pass\n',
            exercise: { prompt: 'Write <code>slack(early_start, late_start)</code>.', test: 'assert slack(3, 3) == 0\nassert slack(2, 5) == 3' } },
          { id: "pm-cycle-time", title: "Cycle Time",
            content: `<p><b>Cycle time</b> is the average time to finish one work item — the heart of flow and throughput.</p><pre><code>total_time / items</code></pre>`,
            starter: 'def cycle_time(total_days, items):\n    # Return the average days per completed item\n    pass\n',
            exercise: { prompt: 'Write <code>cycle_time(total_days, items)</code>.', test: 'assert cycle_time(20, 4) == 5.0\nassert cycle_time(15, 3) == 5.0' } },
          { id: "pm-velocity", title: "Team Velocity",
            content: `<p><b>Velocity</b> is the average story points a team completes per sprint — the basis of forecasting.</p>`,
            starter: 'def velocity(points_per_sprint):\n    # Return the average points per sprint\n    pass\n',
            exercise: { prompt: 'Write <code>velocity(points_per_sprint)</code>.', test: 'assert velocity([10, 20, 30]) == 20.0\nassert velocity([5]) == 5.0' } },
          { id: "pm-burndown", title: "Remaining Work",
            content: `<p>A <b>burndown</b> tracks work left: the total minus everything completed so far.</p>`,
            starter: 'def remaining_work(total, completed):\n    # total minus the sum of completed amounts\n    pass\n',
            exercise: { prompt: 'Write <code>remaining_work(total, completed)</code>.', test: 'assert remaining_work(100, [10, 20, 30]) == 40\nassert remaining_work(50, []) == 50' } },
          { id: "pm-fte", title: "Full-Time Equivalent",
            content: `<p><b>FTE</b> expresses staffing as full-time people: hours divided by a 40-hour week.</p>`,
            starter: 'def fte(hours):\n    # Return the full-time-equivalent for the given weekly hours (40 = 1 FTE)\n    pass\n',
            exercise: { prompt: 'Write <code>fte(hours)</code>.', test: 'assert fte(40) == 1.0\nassert fte(20) == 0.5\nassert fte(80) == 2.0' } },
          { id: "pm-cost-per-point", title: "Cost per Point",
            content: `<p>Dividing cost by delivered story points gives a simple unit-cost of work.</p>`,
            starter: 'def cost_per_point(cost, points):\n    # Return cost divided by points\n    pass\n',
            exercise: { prompt: 'Write <code>cost_per_point(cost, points)</code>.', test: 'assert cost_per_point(1000, 50) == 20.0\nassert cost_per_point(300, 3) == 100.0' } },
          { id: "pm-sprints-left", title: "Sprints Remaining",
            content: `<p>Estimate sprints to finish by dividing remaining work by velocity and rounding up.</p><pre><code>math.ceil(remaining / velocity)</code></pre>`,
            starter: 'import math\n\ndef sprints_left(remaining, velocity):\n    # Return the whole number of sprints needed (round up)\n    pass\n',
            exercise: { prompt: 'Write <code>sprints_left(remaining, velocity)</code>.', test: 'assert sprints_left(100, 30) == 4\nassert sprints_left(60, 20) == 3\nassert sprints_left(0, 10) == 0' } }
        ]
      },
      {
        title: "Cost, Value & Risk",
        lessons: [
          { id: "pm-sv", title: "Schedule Variance",
            content: `<p><b>Schedule Variance</b> compares work done to work planned: positive = ahead of schedule.</p><pre><code>SV = EV - PV</code></pre>`,
            starter: 'def schedule_variance(ev, pv):\n    # Schedule Variance = earned value minus planned value\n    pass\n',
            exercise: { prompt: 'Write <code>schedule_variance(ev, pv)</code>.', test: 'assert schedule_variance(400, 500) == -100\nassert schedule_variance(600, 500) == 100' } },
          { id: "pm-etc", title: "Estimate to Complete",
            content: `<p><b>ETC</b> is the money still needed: the forecast total minus what's already spent.</p><pre><code>EAC - AC</code></pre>`,
            starter: 'def etc(eac, ac):\n    # Estimate to Complete = EAC minus actual cost so far\n    pass\n',
            exercise: { prompt: 'Write <code>etc(eac, ac)</code>.', test: 'assert etc(1250, 500) == 750\nassert etc(1000, 1000) == 0' } },
          { id: "pm-vac", title: "Variance at Completion",
            content: `<p><b>VAC</b> is the projected over/under budget: positive = under budget.</p><pre><code>BAC - EAC</code></pre>`,
            starter: 'def vac(bac, eac):\n    # Variance at Completion = budget minus forecast total\n    pass\n',
            exercise: { prompt: 'Write <code>vac(bac, eac)</code>.', test: 'assert vac(1000, 1250) == -250\nassert vac(1000, 900) == 100' } },
          { id: "pm-tcpi", title: "To-Complete Performance Index",
            content: `<p><b>TCPI</b> is the efficiency needed on remaining work to hit budget.</p><pre><code>(BAC - EV) / (BAC - AC)</code></pre>`,
            starter: 'def tcpi(bac, ev, ac):\n    # (BAC - earned value) / (BAC - actual cost)\n    pass\n',
            exercise: { prompt: 'Write <code>tcpi(bac, ev, ac)</code>.', test: 'assert abs(tcpi(1000, 400, 500) - 1.2) < 1e-9' } },
          { id: "pm-roi", title: "Return on Investment",
            content: `<p><b>ROI</b> measures profit relative to cost.</p><pre><code>(gain - cost) / cost</code></pre>`,
            starter: 'def roi(gain, cost):\n    # Return on investment as a fraction\n    pass\n',
            exercise: { prompt: 'Write <code>roi(gain, cost)</code>.', test: 'assert roi(150, 100) == 0.5\nassert roi(100, 100) == 0.0\nassert roi(50, 100) == -0.5' } },
          { id: "pm-npv", title: "Net Present Value",
            content: `<p><b>NPV</b> discounts future cash flows back to today's value (t = 0 is now).</p><pre><code>sum(cf / (1+rate)**t)</code></pre>`,
            starter: 'def npv(rate, cashflows):\n    # Net present value; cashflows[0] is at t=0, cashflows[1] at t=1, ...\n    pass\n',
            exercise: { prompt: 'Write <code>npv(rate, cashflows)</code>.', test: 'assert abs(npv(0.1, [-100, 60, 60]) - 4.1322314) < 1e-5\nassert npv(0.0, [-100, 50, 50, 50]) == 50.0' } },
          { id: "pm-payback", title: "Payback Period",
            content: `<p>The <b>payback period</b> is how long a constant annual return takes to recover the initial cost.</p><pre><code>initial / annual</code></pre>`,
            starter: 'def payback(initial, annual):\n    # Years to recover the initial cost from a constant annual return\n    pass\n',
            exercise: { prompt: 'Write <code>payback(initial, annual)</code>.', test: 'assert payback(1000, 250) == 4.0\nassert payback(600, 200) == 3.0' } },
          { id: "pm-breakeven", title: "Break-Even Point",
            content: `<p>The <b>break-even</b> quantity is where revenue covers fixed costs, given the margin per unit.</p><pre><code>fixed / (price - unit_cost)</code></pre>`,
            starter: 'def breakeven(fixed, price, var_cost):\n    # Units needed to cover fixed costs: fixed / (price - var_cost)\n    pass\n',
            exercise: { prompt: 'Write <code>breakeven(fixed, price, var_cost)</code>.', test: 'assert breakeven(1000, 10, 5) == 200.0\nassert breakeven(600, 20, 5) == 40.0' } }
        ]
      }
    ]
  },

  /* ======================================================================
   * PRACTICE GYM  (18 drills — repetition builds fluency)
   * ==================================================================== */
  {
    id: "gym",
    title: "Practice Gym",
    tracks: [
      {
        title: "String Drills",
        lessons: [
          { id: "pg-reverse", title: "Reverse a String", content: `<p>Reverse a string. (Hint: the slice <code>[::-1]</code>.)</p>`,
            starter: 'def reverse_string(s):\n    # Return s reversed\n    pass\n',
            exercise: { prompt: 'Write <code>reverse_string(s)</code>.', test: 'assert reverse_string("abc") == "cba"\nassert reverse_string("") == ""\nassert reverse_string("a") == "a"' } },
          { id: "pg-count-char", title: "Count a Character", content: `<p>Count how many times a character appears in a string.</p>`,
            starter: 'def count_char(s, c):\n    # Return how many times c appears in s\n    pass\n',
            exercise: { prompt: 'Write <code>count_char(s, c)</code>.', test: 'assert count_char("banana", "a") == 3\nassert count_char("xyz", "q") == 0' } },
          { id: "pg-title", title: "Title Case", content: `<p>Capitalize the first letter of each word.</p>`,
            starter: 'def title_case(s):\n    # Capitalize the first letter of each space-separated word\n    pass\n',
            exercise: { prompt: 'Write <code>title_case(s)</code>.', test: 'assert title_case("hello world") == "Hello World"\nassert title_case("the quick fox") == "The Quick Fox"' } },
          { id: "pg-anagram", title: "Anagram Check", content: `<p>Two strings are anagrams if they use the same letters. Ignore case and spaces.</p>`,
            starter: 'def is_anagram(a, b):\n    # True if a and b are anagrams (ignore case and spaces)\n    pass\n',
            exercise: { prompt: 'Write <code>is_anagram(a, b)</code>.', test: 'assert is_anagram("listen", "silent") is True\nassert is_anagram("a", "b") is False\nassert is_anagram("Dormitory", "Dirty room") is True' } },
          { id: "pg-count-words", title: "Count Words", content: `<p>Count the words in a sentence.</p>`,
            starter: 'def word_count(s):\n    # Return the number of whitespace-separated words\n    pass\n',
            exercise: { prompt: 'Write <code>word_count(s)</code>.', test: 'assert word_count("a b c") == 3\nassert word_count("") == 0\nassert word_count("  hi   there ") == 2' } },
          { id: "pg-remove-vowels", title: "Remove Vowels", content: `<p>Remove every vowel (a, e, i, o, u) from a string.</p>`,
            starter: 'def remove_vowels(s):\n    # Return s with all vowels removed (case-insensitive)\n    pass\n',
            exercise: { prompt: 'Write <code>remove_vowels(s)</code>.', test: 'assert remove_vowels("Hello") == "Hll"\nassert remove_vowels("AEIOU") == ""\nassert remove_vowels("xyz") == "xyz"' } }
        ]
      },
      {
        title: "List & Loop Drills",
        lessons: [
          { id: "pg-total", title: "Sum with a Loop", content: `<p>Add up a list of numbers with a loop (no <code>sum()</code>).</p>`,
            starter: 'def total(nums):\n    # Return the sum of nums using a loop\n    pass\n',
            exercise: { prompt: 'Write <code>total(nums)</code> with a loop.', test: 'assert total([1, 2, 3]) == 6\nassert total([]) == 0\nassert total([-1, 1]) == 0' } },
          { id: "pg-max", title: "Largest without max()", content: `<p>Find the largest number without using <code>max()</code>.</p>`,
            starter: 'def largest(nums):\n    # Return the largest value in nums (nums is non-empty)\n    pass\n',
            exercise: { prompt: 'Write <code>largest(nums)</code> without <code>max()</code>.', test: 'assert largest([3, 1, 4, 1, 5]) == 5\nassert largest([-3, -1, -2]) == -1\nassert largest([7]) == 7' } },
          { id: "pg-dedupe", title: "De-duplicate", content: `<p>Remove duplicates while keeping first-seen order.</p>`,
            starter: 'def dedupe(items):\n    # Return items with duplicates removed, order preserved\n    pass\n',
            exercise: { prompt: 'Write <code>dedupe(items)</code>.', test: 'assert dedupe([1, 2, 1, 3, 2]) == [1, 2, 3]\nassert dedupe([]) == []\nassert dedupe([5, 5, 5]) == [5]' } },
          { id: "pg-running", title: "Running Totals", content: `<p>Return the running (cumulative) totals of a list.</p>`,
            starter: 'def running_total(nums):\n    # [nums[0], nums[0]+nums[1], ...]\n    pass\n',
            exercise: { prompt: 'Write <code>running_total(nums)</code>.', test: 'assert running_total([1, 2, 3]) == [1, 3, 6]\nassert running_total([]) == []\nassert running_total([5]) == [5]' } },
          { id: "pg-chunk", title: "Chunk a List", content: `<p>Split a list into chunks of a given size.</p>`,
            starter: 'def chunk(items, size):\n    # Split items into sublists of length size (last may be shorter)\n    pass\n',
            exercise: { prompt: 'Write <code>chunk(items, size)</code>.', test: 'assert chunk([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]\nassert chunk([1, 2, 3], 3) == [[1, 2, 3]]\nassert chunk([], 2) == []' } },
          { id: "pg-second-largest", title: "Second Largest", content: `<p>Return the second-largest <i>distinct</i> value.</p>`,
            starter: 'def second_largest(nums):\n    # Return the 2nd largest distinct value\n    pass\n',
            exercise: { prompt: 'Write <code>second_largest(nums)</code>.', test: 'assert second_largest([3, 1, 4, 4, 2]) == 3\nassert second_largest([5, 5, 1]) == 1' } }
        ]
      },
      {
        title: "Numbers & Logic Drills",
        lessons: [
          { id: "pg-fizzbuzz", title: "FizzBuzz", content: `<p>For 1..n: "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both, else the number.</p>`,
            starter: 'def fizzbuzz(n):\n    # Return a list for 1..n with Fizz/Buzz/FizzBuzz rules\n    pass\n',
            exercise: { prompt: 'Write <code>fizzbuzz(n)</code>.', test: 'assert fizzbuzz(5) == [1, 2, "Fizz", 4, "Buzz"]\nassert fizzbuzz(15)[-1] == "FizzBuzz"' } },
          { id: "pg-prime", title: "Prime Check", content: `<p>Decide whether a number is prime. (Tip: only test divisors up to the square root.)</p>`,
            starter: 'def is_prime(n):\n    # Return True if n is a prime number\n    pass\n',
            exercise: { prompt: 'Write <code>is_prime(n)</code>.', test: 'assert is_prime(7) is True\nassert is_prime(1) is False\nassert is_prime(9) is False\nassert is_prime(2) is True' } },
          { id: "pg-gcd", title: "Greatest Common Divisor", content: `<p>Euclid's algorithm: repeatedly replace (a, b) with (b, a % b) until b is 0.</p>`,
            starter: 'def gcd(a, b):\n    # Return the greatest common divisor of a and b\n    pass\n',
            exercise: { prompt: 'Write <code>gcd(a, b)</code>.', test: 'assert gcd(12, 8) == 4\nassert gcd(17, 5) == 1\nassert gcd(100, 10) == 10' } },
          { id: "pg-digit-sum", title: "Digit Sum", content: `<p>Sum the digits of a number.</p>`,
            starter: 'def digit_sum(n):\n    # Return the sum of the digits of n (ignore sign)\n    pass\n',
            exercise: { prompt: 'Write <code>digit_sum(n)</code>.', test: 'assert digit_sum(123) == 6\nassert digit_sum(0) == 0\nassert digit_sum(-45) == 9' } },
          { id: "pg-leap", title: "Leap Year", content: `<p>A year is a leap year if divisible by 4, except centuries unless divisible by 400.</p>`,
            starter: 'def is_leap(year):\n    # Return True if year is a leap year\n    pass\n',
            exercise: { prompt: 'Write <code>is_leap(year)</code>.', test: 'assert is_leap(2000) is True\nassert is_leap(1900) is False\nassert is_leap(2024) is True\nassert is_leap(2023) is False' } },
          { id: "pg-collatz", title: "Collatz Steps", content: `<p>If even, halve it; if odd, 3n+1. Count the steps to reach 1.</p>`,
            starter: 'def collatz_steps(n):\n    # Return how many steps it takes to reach 1\n    pass\n',
            exercise: { prompt: 'Write <code>collatz_steps(n)</code>.', test: 'assert collatz_steps(1) == 0\nassert collatz_steps(6) == 8' } }
        ]
      },
      {
        title: "Dict & Set Drills",
        lessons: [
          { id: "pg-word-freq", title: "Word Frequencies", content: `<p>Count how many times each word appears, returning a dictionary.</p>`,
            starter: 'def word_freq(words):\n    # Return {word: count}\n    pass\n',
            exercise: { prompt: 'Write <code>word_freq(words)</code>.', test: 'assert word_freq(["a", "b", "a"]) == {"a": 2, "b": 1}\nassert word_freq([]) == {}' } },
          { id: "pg-invert", title: "Invert a Dict", content: `<p>Swap keys and values (assume values are unique).</p>`,
            starter: 'def invert(d):\n    # Return a new dict with keys and values swapped\n    pass\n',
            exercise: { prompt: 'Write <code>invert(d)</code>.', test: 'assert invert({"a": 1, "b": 2}) == {1: "a", 2: "b"}\nassert invert({}) == {}' } },
          { id: "pg-common-keys", title: "Common Keys", content: `<p>Return the keys shared by two dicts, sorted. (Sets make this easy.)</p>`,
            starter: 'def common_keys(a, b):\n    # Return the sorted list of keys present in both a and b\n    pass\n',
            exercise: { prompt: 'Write <code>common_keys(a, b)</code>.', test: 'assert common_keys({"a": 1, "b": 2}, {"b": 3, "c": 4}) == ["b"]\nassert common_keys({}, {}) == []' } },
          { id: "pg-group-parity", title: "Group by Even/Odd", content: `<p>Split numbers into even and odd groups in a dict.</p>`,
            starter: 'def group_parity(nums):\n    # Return {"even": [...], "odd": [...]}\n    pass\n',
            exercise: { prompt: 'Write <code>group_parity(nums)</code>.', test: 'assert group_parity([1, 2, 3, 4]) == {"even": [2, 4], "odd": [1, 3]}\nassert group_parity([]) == {"even": [], "odd": []}' } },
          { id: "pg-merge-dicts", title: "Merge Dicts", content: `<p>Combine two dicts; on a clash, the second wins.</p><pre><code>{**a, **b}</code></pre>`,
            starter: 'def merge(a, b):\n    # Return a merged dict (b overrides a on shared keys)\n    pass\n',
            exercise: { prompt: 'Write <code>merge(a, b)</code>.', test: 'assert merge({"a": 1}, {"b": 2}) == {"a": 1, "b": 2}\nassert merge({"a": 1}, {"a": 9}) == {"a": 9}' } },
          { id: "pg-sym-diff", title: "In Exactly One", content: `<p>Return values that appear in one collection but not both (symmetric difference), sorted.</p>`,
            starter: 'def only_in_one(a, b):\n    # Sorted values that are in a or b but not both\n    pass\n',
            exercise: { prompt: 'Write <code>only_in_one(a, b)</code>.', test: 'assert only_in_one([1, 2, 3], [2, 3, 4]) == [1, 4]\nassert only_in_one([1], [1]) == []' } },
          { id: "pg-most-common", title: "Most Common", content: `<p>Return the single most frequent item.</p>`,
            starter: 'def most_common(items):\n    # Return the item that appears most often\n    pass\n',
            exercise: { prompt: 'Write <code>most_common(items)</code>.', test: 'assert most_common([1, 1, 2]) == 1\nassert most_common(["x", "y", "x", "y", "x"]) == "x"' } }
        ]
      },
      {
        title: "Comprehension & Function Drills",
        lessons: [
          { id: "pg-squares", title: "Squares", content: `<p>Build the list of squares from 1 to n with a comprehension.</p>`,
            starter: 'def squares(n):\n    # Return [1, 4, 9, ..., n*n]\n    pass\n',
            exercise: { prompt: 'Write <code>squares(n)</code>.', test: 'assert squares(4) == [1, 4, 9, 16]\nassert squares(0) == []' } },
          { id: "pg-filter-even", title: "Filter Evens", content: `<p>Keep only the even numbers, using a comprehension with a condition.</p>`,
            starter: 'def evens(nums):\n    # Return only the even numbers\n    pass\n',
            exercise: { prompt: 'Write <code>evens(nums)</code>.', test: 'assert evens([1, 2, 3, 4, 5]) == [2, 4]\nassert evens([1, 3]) == []' } },
          { id: "pg-to-dict", title: "Zip into a Dict", content: `<p>Pair two lists into a dict with a comprehension over <code>zip</code>.</p>`,
            starter: 'def to_dict(keys, values):\n    # Return {key: value, ...}\n    pass\n',
            exercise: { prompt: 'Write <code>to_dict(keys, values)</code>.', test: 'assert to_dict(["a", "b"], [1, 2]) == {"a": 1, "b": 2}\nassert to_dict([], []) == {}' } },
          { id: "pg-apply-all", title: "Apply a Function", content: `<p>Functions are values — take one as an argument and apply it to each item.</p>`,
            starter: 'def apply_to_all(fn, items):\n    # Return the list of fn(x) for each x\n    pass\n',
            exercise: { prompt: 'Write <code>apply_to_all(fn, items)</code>.', test: 'assert apply_to_all(lambda x: x * 2, [1, 2, 3]) == [2, 4, 6]\nassert apply_to_all(str, [1, 2]) == ["1", "2"]' } },
          { id: "pg-compose", title: "Compose Functions", content: `<p>Return a new function that runs g, then f. (Return a lambda.)</p><pre><code>lambda x: f(g(x))</code></pre>`,
            starter: 'def compose(f, g):\n    # Return a function h where h(x) == f(g(x))\n    pass\n',
            exercise: { prompt: 'Write <code>compose(f, g)</code>.', test: 'h = compose(lambda x: x + 1, lambda x: x * 2)\nassert h(3) == 7\nassert h(0) == 1' } },
          { id: "pg-count-if", title: "Count If", content: `<p>Count how many items satisfy a predicate function.</p>`,
            starter: 'def count_if(pred, items):\n    # Return how many items make pred(item) true\n    pass\n',
            exercise: { prompt: 'Write <code>count_if(pred, items)</code>.', test: 'assert count_if(lambda x: x > 0, [-1, 2, 3]) == 2\nassert count_if(lambda x: True, []) == 0' } }
        ]
      },
      {
        title: "OOP, Errors & Recursion Drills",
        lessons: [
          { id: "pg-point", title: "Point Class", content: `<p>A class holding x, y with a method for its distance to the origin.</p>`,
            starter: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def distance_to_origin(self):\n        # Return the straight-line distance to (0, 0)\n        pass\n',
            exercise: { prompt: 'Complete <code>Point.distance_to_origin()</code>.', test: 'assert Point(3, 4).distance_to_origin() == 5.0\nassert Point(0, 0).distance_to_origin() == 0.0' } },
          { id: "pg-stack", title: "Stack Class", content: `<p>A last-in-first-out stack: push, pop, and is_empty.</p>`,
            starter: 'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, x):\n        # add x to the top\n        pass\n\n    def pop(self):\n        # remove and return the top item\n        pass\n\n    def is_empty(self):\n        # True when there are no items\n        pass\n',
            exercise: { prompt: 'Build the <code>Stack</code> class.', test: 's = Stack()\nassert s.is_empty()\ns.push(1); s.push(2)\nassert s.pop() == 2\nassert s.pop() == 1\nassert s.is_empty()' } },
          { id: "pg-safe-divide", title: "Safe Divide", content: `<p>Divide, but return <code>None</code> instead of crashing on divide-by-zero.</p>`,
            starter: 'def safe_divide(a, b):\n    # Return a / b, or None if b is zero (use try/except)\n    pass\n',
            exercise: { prompt: 'Write <code>safe_divide(a, b)</code>.', test: 'assert safe_divide(10, 2) == 5.0\nassert safe_divide(5, 0) is None' } },
          { id: "pg-validate-age", title: "Validate Age", content: `<p>Return the age, but raise <code>ValueError</code> for a negative one.</p>`,
            starter: 'def validate_age(age):\n    # Return age, or raise ValueError if it is negative\n    pass\n',
            exercise: { prompt: 'Write <code>validate_age(age)</code>.', test: 'assert validate_age(30) == 30\nok = False\ntry:\n    validate_age(-1)\nexcept ValueError:\n    ok = True\nassert ok' } },
          { id: "pg-sum-rec", title: "Recursive Sum", content: `<p>Sum a list <b>recursively</b> — no loop, no <code>sum()</code>.</p>`,
            starter: 'def sum_list(nums):\n    # Return the sum of nums using recursion\n    pass\n',
            exercise: { prompt: 'Write <code>sum_list(nums)</code> recursively.', test: 'assert sum_list([1, 2, 3, 4]) == 10\nassert sum_list([]) == 0\nassert sum_list([5]) == 5' } },
          { id: "pg-power-rec", title: "Recursive Power", content: `<p>Compute base<sup>exp</sup> <b>recursively</b>.</p>`,
            starter: 'def power(base, exp):\n    # Return base ** exp using recursion\n    pass\n',
            exercise: { prompt: 'Write <code>power(base, exp)</code> recursively.', test: 'assert power(2, 10) == 1024\nassert power(5, 0) == 1\nassert power(3, 3) == 27' } }
        ]
      }
    ]
  },

  /* ======================================================================
   * PROJECTS  (9 builds — combine skills into small programs)
   * ==================================================================== */
  {
    id: "projects",
    title: "Projects",
    tracks: [
      {
        title: "Starter Projects",
        lessons: [
          { id: "proj-guess", title: "Guessing Game", content: `<p>The core of a number-guessing game: compare a guess to the secret and say which way to go.</p>`,
            starter: 'def check_guess(secret, guess):\n    # Return "correct", "too high", or "too low"\n    pass\n',
            exercise: { prompt: 'Write <code>check_guess(secret, guess)</code>.', test: 'assert check_guess(50, 50) == "correct"\nassert check_guess(50, 70) == "too high"\nassert check_guess(50, 30) == "too low"' } },
          { id: "proj-temp", title: "Temperature Converter", content: `<p>Celsius to Fahrenheit and back: <code>F = C*9/5 + 32</code>.</p>`,
            starter: 'def c_to_f(c):\n    # Celsius -> Fahrenheit\n    pass\n\ndef f_to_c(f):\n    # Fahrenheit -> Celsius\n    pass\n',
            exercise: { prompt: 'Write <code>c_to_f(c)</code> and <code>f_to_c(f)</code>.', test: 'assert c_to_f(0) == 32\nassert c_to_f(100) == 212\nassert f_to_c(32) == 0\nassert abs(f_to_c(212) - 100) < 1e-9' } },
          { id: "proj-password", title: "Password Strength", content: `<p>Rate a password: <b>strong</b> if 8+ chars with a digit and an uppercase letter; <b>medium</b> if 6+ chars; otherwise <b>weak</b>.</p>`,
            starter: 'def password_strength(pw):\n    # Return "strong" / "medium" / "weak" by the rules in the lesson\n    pass\n',
            exercise: { prompt: 'Write <code>password_strength(pw)</code>.', test: 'assert password_strength("Ab3xxxxx") == "strong"\nassert password_strength("abcdef") == "medium"\nassert password_strength("abc") == "weak"' } },
          { id: "proj-tally", title: "Vote Tally", content: `<p>Count votes and return the winner (the option with the most votes).</p>`,
            starter: 'def winner(votes):\n    # votes is a list of names; return the most common one\n    pass\n',
            exercise: { prompt: 'Write <code>winner(votes)</code>.', test: 'assert winner(["a", "b", "a"]) == "a"\nassert winner(["x"]) == "x"' } }
        ]
      },
      {
        title: "Bigger Builds",
        lessons: [
          { id: "proj-wordstats", title: "Text Analyzer", content: `<p>Analyze text: return a dict with the word count, number of unique words, and the longest word (first if tied).</p>`,
            starter: 'def word_stats(text):\n    # Return {"words": n, "unique": m, "longest": word}\n    pass\n',
            exercise: { prompt: 'Write <code>word_stats(text)</code>.', test: 'r = word_stats("the cat sat on the mat")\nassert r["words"] == 6\nassert r["unique"] == 5\nassert r["longest"] == "the"' } },
          { id: "proj-todo", title: "To-Do List", content: `<p>A to-do list: add tasks, mark them complete, and list what is still pending.</p>`,
            starter: 'class TodoList:\n    def __init__(self):\n        self.tasks = []\n\n    def add(self, task):\n        # store the task as not-yet-complete\n        pass\n\n    def complete(self, task):\n        # mark the matching task complete\n        pass\n\n    def pending(self):\n        # return the names of tasks not yet complete\n        pass\n',
            exercise: { prompt: 'Build the <code>TodoList</code> class.', test: 't = TodoList()\nt.add("a")\nt.add("b")\nt.complete("a")\nassert t.pending() == ["b"]' } },
          { id: "proj-bank", title: "Bank Account", content: `<p>A bank account: deposit, and withdraw only if funds allow (else return <code>False</code> and leave the balance unchanged).</p>`,
            starter: 'class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        # add to the balance\n        pass\n\n    def withdraw(self, amount):\n        # if amount > balance return False; else subtract and return True\n        pass\n',
            exercise: { prompt: 'Build the <code>BankAccount</code> class with overdraft protection.', test: 'a = BankAccount(100)\na.deposit(50)\nassert a.balance == 150\nassert a.withdraw(200) is False\nassert a.balance == 150\nassert a.withdraw(100) is True\nassert a.balance == 50' } },
          { id: "proj-tictactoe", title: "Tic-Tac-Toe Winner", content: `<p>Given a 3×3 board (cells "X", "O", or ""), return the winner ("X" or "O") or <code>None</code>.</p>`,
            starter: 'def winner(board):\n    # board is a 3x3 list; return "X", "O", or None\n    pass\n',
            exercise: { prompt: 'Write <code>winner(board)</code> checking rows, columns, and diagonals.', test: 'assert winner([["X", "X", "X"], ["", "O", ""], ["O", "", ""]]) == "X"\nassert winner([["O", "X", "X"], ["O", "", ""], ["O", "", ""]]) == "O"\nassert winner([["X", "O", "X"], ["X", "O", "O"], ["O", "X", "X"]]) is None' } },
          { id: "proj-roman", title: "Roman Numerals", content: `<p>Convert an integer (1–3999) to a Roman numeral.</p>
              <pre><code>4 -> "IV",  9 -> "IX",  58 -> "LVIII"</code></pre>`,
            starter: 'def to_roman(n):\n    # Return the Roman numeral for n (1..3999)\n    pass\n',
            exercise: { prompt: 'Write <code>to_roman(n)</code>.', test: 'assert to_roman(4) == "IV"\nassert to_roman(9) == "IX"\nassert to_roman(58) == "LVIII"\nassert to_roman(1994) == "MCMXCIV"' } }
        ]
      },
      {
        title: "Games & Puzzles",
        lessons: [
          { id: "proj-rps", title: "Rock Paper Scissors", content: `<p>Decide the winner of a round: return <code>"a"</code>, <code>"b"</code>, or <code>"tie"</code>.</p>`,
            starter: 'def rps_winner(a, b):\n    # a and b are "rock"/"paper"/"scissors"; return "a", "b", or "tie"\n    pass\n',
            exercise: { prompt: 'Write <code>rps_winner(a, b)</code>.', test: 'assert rps_winner("rock", "scissors") == "a"\nassert rps_winner("rock", "paper") == "b"\nassert rps_winner("rock", "rock") == "tie"' } },
          { id: "proj-mask-word", title: "Hangman Mask", content: `<p>Show a word with un-guessed letters hidden as underscores.</p>`,
            starter: 'def mask_word(word, guessed):\n    # guessed is a set of letters; hide the rest as "_"\n    pass\n',
            exercise: { prompt: 'Write <code>mask_word(word, guessed)</code>.', test: 'assert mask_word("apple", {"a", "p"}) == "app__"\nassert mask_word("hi", set()) == "__"' } },
          { id: "proj-caesar", title: "Caesar Cipher", content: `<p>Shift each lowercase letter forward by <code>shift</code>, wrapping past z. Leave other characters alone.</p>`,
            starter: 'def caesar_encode(text, shift):\n    # Shift lowercase letters by shift (wrap around); leave others unchanged\n    pass\n',
            exercise: { prompt: 'Write <code>caesar_encode(text, shift)</code>.', test: 'assert caesar_encode("abc", 1) == "bcd"\nassert caesar_encode("xyz", 3) == "abc"\nassert caesar_encode("hi!", 0) == "hi!"' } },
          { id: "proj-longest-streak", title: "Longest Streak", content: `<p>Find the longest run of a target value in a list of results.</p>`,
            starter: 'def longest_streak(results, target):\n    # Return the length of the longest consecutive run of target\n    pass\n',
            exercise: { prompt: 'Write <code>longest_streak(results, target)</code>.', test: 'assert longest_streak(["W", "W", "L", "W"], "W") == 2\nassert longest_streak([], "W") == 0\nassert longest_streak(["L"], "W") == 0' } },
          { id: "proj-magic", title: "Magic Square", content: `<p>A square is "magic" if every row, column, and both diagonals sum to the same total.</p>`,
            starter: 'def is_magic(grid):\n    # Return True if all rows, columns, and diagonals share one sum\n    pass\n',
            exercise: { prompt: 'Write <code>is_magic(grid)</code>.', test: 'assert is_magic([[2, 7, 6], [9, 5, 1], [4, 3, 8]]) is True\nassert is_magic([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) is False' } },
          { id: "proj-dice-pair", title: "Any Pair?", content: `<p>Return True if any value appears at least twice.</p>`,
            starter: 'def has_pair(rolls):\n    # True if two or more rolls share a value\n    pass\n',
            exercise: { prompt: 'Write <code>has_pair(rolls)</code>.', test: 'assert has_pair([1, 2, 2, 3]) is True\nassert has_pair([1, 2, 3]) is False\nassert has_pair([]) is False' } },
          { id: "proj-guess-feedback", title: "Guess Feedback", content: `<p>Turn a list of guesses into hints against the secret.</p>`,
            starter: 'def feedback(secret, guesses):\n    # Return a list of "too low" / "too high" / "correct" for each guess\n    pass\n',
            exercise: { prompt: 'Write <code>feedback(secret, guesses)</code>.', test: 'assert feedback(50, [30, 70, 50]) == ["too low", "too high", "correct"]' } }
        ]
      },
      {
        title: "Text Tools",
        lessons: [
          { id: "proj-count-vowels", title: "Count Vowels", content: `<p>Count the vowels in a string (case-insensitive).</p>`,
            starter: 'def count_vowels(s):\n    # Count a, e, i, o, u (any case)\n    pass\n',
            exercise: { prompt: 'Write <code>count_vowels(s)</code>.', test: 'assert count_vowels("Hello") == 2\nassert count_vowels("xyz") == 0' } },
          { id: "proj-palindrome", title: "Palindrome Check", content: `<p>Ignore case and non-letters: is it the same forwards and backwards?</p>`,
            starter: 'def is_palindrome(s):\n    # True if s reads the same backward, ignoring case and punctuation\n    pass\n',
            exercise: { prompt: 'Write <code>is_palindrome(s)</code>.', test: 'assert is_palindrome("Racecar") is True\nassert is_palindrome("A man a plan a canal Panama") is True\nassert is_palindrome("hello") is False' } },
          { id: "proj-acronym", title: "Make an Acronym", content: `<p>Take the first letter of each word, uppercased.</p>`,
            starter: 'def acronym(phrase):\n    # "hyper text markup language" -> "HTML"\n    pass\n',
            exercise: { prompt: 'Write <code>acronym(phrase)</code>.', test: 'assert acronym("hyper text markup language") == "HTML"\nassert acronym("as soon as possible") == "ASAP"' } },
          { id: "proj-word-lengths", title: "Word Lengths", content: `<p>Map each word to its length.</p>`,
            starter: 'def word_lengths(sentence):\n    # Return {word: length} for each word\n    pass\n',
            exercise: { prompt: 'Write <code>word_lengths(sentence)</code>.', test: 'assert word_lengths("the cat") == {"the": 3, "cat": 3}' } },
          { id: "proj-censor", title: "Censor a Word", content: `<p>Replace a banned word with the same number of asterisks.</p>`,
            starter: 'def censor(text, bad):\n    # Replace every occurrence of bad with "*" repeated to its length\n    pass\n',
            exercise: { prompt: 'Write <code>censor(text, bad)</code>.', test: 'assert censor("i like spam", "spam") == "i like ****"\nassert censor("ok", "bad") == "ok"' } },
          { id: "proj-initials", title: "Initials", content: `<p>Turn a full name into dotted initials.</p><pre><code>"ada lovelace" -> "A.L."</code></pre>`,
            starter: 'def initials(name):\n    # "ada lovelace" -> "A.L."\n    pass\n',
            exercise: { prompt: 'Write <code>initials(name)</code>.', test: 'assert initials("john ronald tolkien") == "J.R.T."\nassert initials("ada lovelace") == "A.L."' } },
          { id: "proj-longest-word", title: "Longest Word", content: `<p>Return the longest word in a sentence (first one if tied).</p>`,
            starter: 'def longest_word(sentence):\n    # Return the longest word\n    pass\n',
            exercise: { prompt: 'Write <code>longest_word(sentence)</code>.', test: 'assert longest_word("the quick brown fox") == "quick"\nassert longest_word("a bb ccc") == "ccc"' } }
        ]
      },
      {
        title: "Everyday Utilities",
        lessons: [
          { id: "proj-tip", title: "Tip Calculator", content: `<p>Add a percentage tip to a bill.</p>`,
            starter: 'def total_with_tip(bill, percent):\n    # Return the bill plus a percent tip\n    pass\n',
            exercise: { prompt: 'Write <code>total_with_tip(bill, percent)</code>.', test: 'assert total_with_tip(100, 20) == 120.0\nassert total_with_tip(50, 10) == 55.0' } },
          { id: "proj-split-bill", title: "Split the Bill", content: `<p>Split a total evenly, rounded to cents.</p>`,
            starter: 'def split_bill(total, people):\n    # Return each share of the total, rounded to 2 decimals\n    pass\n',
            exercise: { prompt: 'Write <code>split_bill(total, people)</code>.', test: 'assert split_bill(100, 4) == 25.0\nassert split_bill(100, 3) == 33.33' } },
          { id: "proj-hms", title: "Seconds to HH:MM:SS", content: `<p>Format a number of seconds as zero-padded hours:minutes:seconds.</p>`,
            starter: 'def to_hms(seconds):\n    # Return "HH:MM:SS" (zero-padded)\n    pass\n',
            exercise: { prompt: 'Write <code>to_hms(seconds)</code>.', test: 'assert to_hms(3661) == "01:01:01"\nassert to_hms(0) == "00:00:00"\nassert to_hms(59) == "00:00:59"' } },
          { id: "proj-cart", title: "Shopping Cart Total", content: `<p>Sum price × quantity across cart items.</p>`,
            starter: 'def cart_total(items):\n    # items is a list of (price, quantity) pairs; return the total\n    pass\n',
            exercise: { prompt: 'Write <code>cart_total(items)</code>.', test: 'assert cart_total([(2.0, 3), (5.0, 1)]) == 11.0\nassert cart_total([]) == 0' } },
          { id: "proj-discount", title: "Apply a Discount", content: `<p>Reduce a price by a percentage.</p>`,
            starter: 'def apply_discount(price, percent):\n    # Return the price after taking off percent\n    pass\n',
            exercise: { prompt: 'Write <code>apply_discount(price, percent)</code>.', test: 'assert apply_discount(100, 25) == 75.0\nassert apply_discount(50, 0) == 50.0' } },
          { id: "proj-grade", title: "Letter Grade", content: `<p>Map a score to a letter: 90+ A, 80+ B, 70+ C, 60+ D, else F.</p>`,
            starter: 'def letter_grade(score):\n    # Return "A"/"B"/"C"/"D"/"F" by the usual cutoffs\n    pass\n',
            exercise: { prompt: 'Write <code>letter_grade(score)</code>.', test: 'assert letter_grade(95) == "A"\nassert letter_grade(72) == "C"\nassert letter_grade(60) == "D"\nassert letter_grade(50) == "F"' } },
          { id: "proj-bmi", title: "BMI", content: `<p>Body Mass Index = weight / height², rounded to one decimal.</p>`,
            starter: 'def bmi(weight_kg, height_m):\n    # Return the BMI rounded to 1 decimal\n    pass\n',
            exercise: { prompt: 'Write <code>bmi(weight_kg, height_m)</code>.', test: 'assert bmi(70, 1.75) == 22.9\nassert bmi(50, 2.0) == 12.5' } }
        ]
      },
      {
        title: "Data & Logic Builds",
        lessons: [
          { id: "proj-running-max", title: "Running Maximum", content: `<p>Return the running maximum seen so far at each position.</p>`,
            starter: 'def running_max(nums):\n    # [max of nums[:1], max of nums[:2], ...]\n    pass\n',
            exercise: { prompt: 'Write <code>running_max(nums)</code>.', test: 'assert running_max([3, 1, 4, 1, 5]) == [3, 3, 4, 4, 5]\nassert running_max([]) == []' } },
          { id: "proj-median", title: "Median", content: `<p>The middle value (average of the two middle values for an even count).</p>`,
            starter: 'def median(nums):\n    # Return the median value\n    pass\n',
            exercise: { prompt: 'Write <code>median(nums)</code>.', test: 'assert median([3, 1, 2]) == 2\nassert median([1, 2, 3, 4]) == 2.5\nassert median([5]) == 5' } },
          { id: "proj-topk", title: "Top K Frequent", content: `<p>Return the k most frequent items, most-common first.</p>`,
            starter: 'def top_k(items, k):\n    # Return the k most common items (most frequent first)\n    pass\n',
            exercise: { prompt: 'Write <code>top_k(items, k)</code>.', test: 'assert top_k([1, 1, 2, 2, 2, 3], 2) == [2, 1]\nassert top_k(["a"], 1) == ["a"]' } },
          { id: "proj-passing-rate", title: "Passing Rate", content: `<p>What fraction of scores meet a threshold?</p>`,
            starter: 'def passing_rate(scores, threshold):\n    # Return the fraction of scores >= threshold\n    pass\n',
            exercise: { prompt: 'Write <code>passing_rate(scores, threshold)</code>.', test: 'assert passing_rate([60, 60, 60, 60], 60) == 1.0\nassert passing_rate([10, 90], 50) == 0.5' } },
          { id: "proj-count-range", title: "Count in Range", content: `<p>Count values within an inclusive range.</p>`,
            starter: 'def count_in_range(nums, lo, hi):\n    # Count values x with lo <= x <= hi\n    pass\n',
            exercise: { prompt: 'Write <code>count_in_range(nums, lo, hi)</code>.', test: 'assert count_in_range([1, 5, 10, 15], 5, 10) == 2\nassert count_in_range([], 0, 10) == 0' } },
          { id: "proj-transpose", title: "Transpose a Matrix", content: `<p>Swap rows and columns.</p><pre><code>zip(*matrix)</code></pre>`,
            starter: 'def transpose(matrix):\n    # Return the matrix with rows and columns swapped\n    pass\n',
            exercise: { prompt: 'Write <code>transpose(matrix)</code>.', test: 'assert transpose([[1, 2, 3], [4, 5, 6]]) == [[1, 4], [2, 5], [3, 6]]\nassert transpose([[1], [2]]) == [[1, 2]]' } },
          { id: "proj-rle", title: "Run-Length Encode", content: `<p>Compress a string into (character, count) runs.</p><pre><code>"aaabbc" -> [("a",3),("b",2),("c",1)]</code></pre>`,
            starter: 'def encode(s):\n    # Return a list of (char, run-length) tuples\n    pass\n',
            exercise: { prompt: 'Write <code>encode(s)</code>.', test: 'assert encode("aaabbc") == [("a", 3), ("b", 2), ("c", 1)]\nassert encode("") == []' } }
        ]
      }
    ]
  }
];

// Backward-compatible alias.
const CURRICULUM = COURSES;

/*
 * A one-or-two-sentence "why it matters" shown under each exercise, keyed by
 * lesson id. Kept separate from the lessons so it's easy to edit in one place.
 */
const LESSON_WHY = {
  // ---- Core Python ----
  "b-hello": "Printing is how a program talks back to you — every program's output and every debugging session starts here.",
  "b-variables": "Variables let a program remember values and reuse them. Naming data clearly is the foundation of readable code.",
  "b-strings": "Text is everywhere — names, messages, files. f-strings are the clean modern way to build it, and functions let you reuse logic instead of repeating it.",
  "b-numbers": "Almost every program does arithmetic — prices, scores, measurements. Knowing the operators (and that / gives a float) prevents subtle bugs.",
  "b-lists": "Lists hold collections you process together. Indexing from the start (0) and end (-1) is something you'll reach for constantly.",
  "b-conditionals": "Software makes decisions — approve/deny, pass/fail, which path to take. if/elif/else is how you encode those rules.",
  "b-loops": "Loops let the same code handle any amount of data — one item or a million. Repetition is the heart of automation.",
  "b-functions": "Functions package logic so you write it once and reuse it, and building a result step by step in a loop is a pattern you'll use daily.",
  "i-dicts": "Dictionaries map keys to values — the go-to tool for counting, grouping, and fast lookups (a database index in miniature).",
  "i-comprehensions": "Comprehensions turn a loop-and-append into one readable line. They're idiomatic Python and show up everywhere in real code.",
  "i-tuples": "Returning several values as a tuple and unpacking them keeps functions clean — used constantly for coordinates, min/max, and key/value pairs.",
  "i-errors": "Real programs hit bad input and edge cases. try/except lets your code recover gracefully instead of crashing on the user.",
  "i-strings2": "Cleaning and checking text — casing, trimming, reversing — is a huge part of real data work and input validation.",
  "i-oop": "Classes bundle data with the behavior that acts on it. Objects model real things (a user, an account, a game piece) and scale to large programs.",
  "i-stdlib": "Python's standard library means you rarely start from scratch. Reaching for the right module saves time and avoids reinventing bugs.",
  "e-decorators": "Decorators add behavior — logging, timing, auth, caching — around a function without changing it. Web frameworks lean on this everywhere.",
  "e-generators": "Generators produce values on demand, so you can process huge or even infinite streams without loading everything into memory.",
  "e-args": "*args/**kwargs let functions accept flexible arguments — essential for writing wrappers, decorators, and clean APIs.",
  "e-dunder": "Dunder methods make your objects behave like built-ins (+, ==, printing). This is how good libraries feel natural to use.",
  "e-functional": "Expressing a transformation as a generator expression is concise, fast, and memory-light — a hallmark of fluent Python.",
  "e-recursion": "Recursion solves problems that break into smaller copies of themselves — trees, file systems, and many algorithms are naturally recursive.",

  // ---- AI & Machine Learning ----
  "ai-arrays": "Vectorized array math is why NumPy is fast, and every ML model is arrays under the hood — this is step one for AI work.",
  "ai-dot": "The dot product is the single most common operation in ML — every neuron computes one. Master it and neural nets stop feeling mysterious.",
  "ai-normalize": "Models train poorly when features have wildly different ranges. Scaling to [0, 1] is a routine, essential preprocessing step.",
  "ai-distance": "Recommendations, clustering, and k-NN all rank items by distance — this is how 'similar' becomes a number a computer can act on.",
  "ai-matrix": "A neural-network layer is a matrix multiply. Understanding @ demystifies what deep-learning frameworks are doing internally.",
  "ai-standardize": "Standardizing to mean 0 / std 1 is what most models and gradient methods expect — it makes training stable and fair across features.",
  "ai-onehot": "Models need numbers, not category names. One-hot encoding is the standard way to feed categories (colors, words, classes) into ML.",
  "ai-linear": "Prediction plus a loss you minimize is the core loop of all supervised learning, and MSE is the classic error signal for regression.",
  "ai-sigmoid": "The sigmoid turns a raw score into a probability — the basis of logistic regression and the output of many classifiers.",
  "ai-mae": "MAE measures average error in the data's own units and shrugs off outliers, which makes it a favorite metric for forecasts.",
  "ai-accuracy": "Accuracy is the first number everyone checks on a classifier — computing it yourself makes model evaluation concrete.",
  "ai-gradient": "Gradient descent is how virtually every model learns — nudging parameters to reduce error. One step here is the whole idea in miniature.",
  "ai-softmax": "Softmax turns scores into a probability distribution over classes — the final layer of most multi-class classifiers and language models.",
  "ai-relu": "ReLU is the activation that made deep networks trainable: simple, fast, and present in almost every modern neural net.",
  "ai-split": "You must test a model on unseen data or you fool yourself. Splitting into train/test is the discipline that keeps ML honest.",
  "ai-knn": "k-NN classifies by asking 'what are my neighbors?' — an intuitive baseline that shows how distance drives prediction.",
  "ai-confusion": "Accuracy hides mistakes; the confusion matrix shows exactly what kind. It's the foundation of every serious classifier evaluation.",
  "ai-precision-recall": "Precision and recall reveal the tradeoff between false alarms and missed cases — critical in medicine, fraud, and search.",
  "ai-sklearn": "scikit-learn's fit/predict is the workflow of practical ML — training a real classifier in a few lines is the payoff of the fundamentals.",
  "ai-kmeans": "k-means finds structure in unlabeled data — customer segments, image colors, topics. It's the classic intro to unsupervised learning.",
  "ai-tree": "Decision trees are easy to read and explain, which matters when a model's reasoning has to be justified — loans, healthcare, hiring.",
  "ai-reshape": "Reshaping is constant in ML — turning flat pixels into a grid, or a list into a batch of feature rows.",
  "ai-colmeans": "Per-column statistics are the foundation of normalization and feature analysis.",
  "ai-argmax": "argmax turns a model's class probabilities into an actual prediction — the last step of classification.",
  "ai-clip": "Clipping guards against invalid or extreme values — keeping probabilities legal and taming outliers.",
  "ai-broadcast": "Broadcasting is how NumPy applies operations across arrays without slow loops — the source of its speed.",
  "ai-l2": "Vector length (L2 norm) underpins distances, similarity, and the regularization that prevents overfitting.",
  "ai-cosine": "Cosine similarity powers search, recommendations, and matching text embeddings by direction rather than size.",
  "ai-classcounts": "Checking class balance early prevents models that just predict the majority class.",
  "ai-rmse": "RMSE is the metric most regression results are reported in — error in the data's own units.",
  "ai-r2": "R² tells you how much of the pattern a model actually captured — the standard goodness-of-fit score.",
  "ai-bce": "Cross-entropy is the loss that trains virtually every classifier and language model.",
  "ai-f1": "F1 summarizes precision and recall in one number — the go-to metric when classes are imbalanced.",
  "ai-linreg-fit": "Fitting a line with scikit-learn is the simplest real model, and its coefficients are how you interpret it.",
  "ai-knn-sklearn": "Using scikit-learn's k-NN shows the fit/predict workflow you'll use for every model in the library.",
  "ai-score": "Scoring a model is the basic measurement every ML experiment reports.",
  "ai-scale": "StandardScaler is the preprocessing step almost every scikit-learn pipeline starts with.",

  // ---- Data & Biomedical ----
  "data-df": "The DataFrame is the spreadsheet of code — the workhorse for clinical records, CSVs, and analytics. Almost all data work starts here.",
  "data-filter": "Selecting the rows that matter (patients over 18, sales this quarter) is the most common data operation there is.",
  "data-agg": "Group-and-summarize answers most analytics questions: average per cohort, totals per region. It's the backbone of reporting.",
  "data-sort": "Ranking and taking the top-N surfaces what matters — best sellers, sickest patients, biggest risks — out of a sea of rows.",
  "data-missing": "Real datasets have gaps. Handling missing values deliberately prevents silent errors and skewed results downstream.",
  "data-newcol": "Deriving new columns (BMI, growth rate, flags) is feature engineering — turning raw data into something models and reports can use.",
  "data-count": "Tallying categories is the first look at any dataset — how many of each type — and it drives charts and sanity checks.",
  "stat-summary": "Mean and median are the first questions about any measurement, and knowing when they disagree flags skew and outliers.",
  "stat-std": "Standard deviation quantifies spread — how consistent a process or measurement is. It underlies quality control and confidence intervals.",
  "stat-quartiles": "Quartiles power box plots and describe a distribution's shape without assuming a bell curve — robust and widely used.",
  "stat-correlation": "Correlation measures how two variables move together — the starting point for spotting relationships (dose vs. effect, spend vs. sales).",
  "stat-outliers": "Outliers can be errors or the most interesting cases. Z-scores give an objective, automatic way to flag them.",
  "stat-probabilities": "Turning counts into probabilities is the bridge from raw data to statistics, risk models, and machine learning.",
  "stat-linreg": "Fitting a line is the simplest predictive model and the foundation of regression — trend lines, forecasts, and effect estimates.",
  "bio-bmi": "BMI categories are a routine clinical screen. Encoding health rules in code is how decision-support tools and dashboards get built.",
  "bio-gc": "GC content affects DNA stability and is a standard first metric when analyzing a sequence or designing primers.",
  "bio-complement": "Base pairing is the core rule of DNA. Computing a complement is a building block for nearly every sequence tool.",
  "bio-revcomp": "The reverse complement is the most-used operation in genomics — reading the opposite strand, finding primers, matching reads.",
  "bio-transcribe": "Transcription (DNA to RNA) is the first step of gene expression; modeling it in code underpins bioinformatics pipelines.",
  "bio-findstart": "Locating the ATG start codon is how you find where a gene begins — a basic step in annotating sequences.",
  "bio-hamming": "Counting mismatches measures how different two sequences are — used to spot mutations and compare related genes.",
  "data-rename": "Clear column names make data readable and code self-documenting — usually the first cleanup step.",
  "data-dropna": "Real datasets have gaps; deciding how to handle missing values is a core part of every analysis.",
  "data-sum-col": "Totaling a column is the simplest aggregation — the basis of reports and summaries.",
  "data-double": "Vectorized column math is how pandas transforms whole datasets fast, without Python loops.",
  "data-merge": "Joining tables on a key is how separate datasets (patients + lab results, orders + customers) come together.",
  "data-highest": "Finding which row holds the extreme value answers 'who scored highest?' — a constant analysis question.",
  "data-distinct": "Listing unique values reveals the categories in a column and catches typos or unexpected entries.",
  "data-groupsize": "Group counts are the heart of 'how many per category' — the most common summary in analytics.",
  "stat-variance": "Variance quantifies how spread out data is — the foundation of statistics and error bars.",
  "stat-range": "The range is the quickest measure of spread and a fast sanity check on your data.",
  "stat-mode": "The mode is the most common value — the right 'average' for categories and survey responses.",
  "stat-iqr": "The IQR describes the middle 50% and is the robust spread measure behind box plots and outlier rules.",
  "stat-covariance": "Covariance is the first step toward correlation — it shows whether two measures move together.",
  "stat-cumsum": "Running totals turn per-period values into cumulative curves — revenue-to-date, dosage totals, progress.",
  "stat-percentile": "Percentiles rank a value against the rest — growth charts, test scores, and SLA targets all use them.",
  "stat-weighted-mean": "Weighted means appear wherever grades, ratings, and indexes are computed — not all values count equally.",

  // ---- Project Management ----
  "pm-duration": "Rolling up task durations is the first estimate any plan needs — the total before dependencies and resources complicate it.",
  "pm-dates": "Projects live on calendars. Computing durations between dates is behind every deadline, milestone, and countdown.",
  "pm-critical": "The critical path determines the earliest a project can finish, so it tells you which tasks you can't afford to let slip.",
  "pm-projdur": "The longest path through the tasks is the project's real duration — the number stakeholders actually ask for.",
  "pm-milestones": "Milestones mark key checkpoints for reporting and payments; pulling them out of a plan drives status updates.",
  "pm-percent": "Duration-weighted percent complete gives an honest progress number — a big task at 50% counts more than a tiny one that's done.",
  "pm-workdays": "Real schedules skip weekends. Counting work days rather than calendar days is essential for accurate delivery dates.",
  "pm-budget": "Spotting line items that blew their budget is the daily job of cost control — seeing where the money went off plan.",
  "pm-totalcost": "Rolling up actual spend is the basic number every budget review starts from.",
  "pm-variance": "Variance (planned minus actual) tells you at a glance whether the project is over or under budget overall.",
  "pm-cpi": "CPI is the standard earned-value measure of cost efficiency — above 1.0 means more value per dollar than planned.",
  "pm-spi": "SPI measures schedule efficiency in the same earned-value framework — a quick read on whether you're ahead or behind.",
  "pm-burn": "Burn rate — average spend per period — tells you how long the money lasts, which is vital for budgets and startup runway.",
  "pm-eac": "Estimate at Completion forecasts the final cost from performance so far, turning today's CPI into a credible bottom line.",
  "pm-risk": "Bucketing risks as Low/Medium/High is how teams prioritize what to watch — the everyday output of a risk register.",
  "pm-riskscore": "Probability times impact is the standard risk score that lets you compare very different risks on one scale.",
  "pm-toprisks": "Ranking risks focuses attention where it counts — you can't mitigate everything, so you tackle the biggest first.",
  "pm-emv": "Expected monetary value converts risks into dollars to set aside — the basis for a contingency budget.",
  "pm-util": "Utilization shows whether people are under- or over-loaded — the key to realistic capacity planning.",
  "pm-overalloc": "Finding over-allocated people prevents burnout and missed dates — a routine resource-leveling check.",
  "pm-quadrant": "The Eisenhower matrix (urgent vs. important) is a classic tool for deciding what to do now, schedule, delegate, or drop.",
  "pm-pert": "PERT estimates temper wishful single-point guesses by blending optimistic, likely, and pessimistic cases.",
  "pm-slack": "Slack tells you which tasks can slip safely and which sit on the critical path — the core of scheduling.",
  "pm-cycle-time": "Cycle time is the flow metric behind Kanban and throughput forecasting — how fast work actually moves.",
  "pm-velocity": "Velocity is the number agile teams use to forecast how much they can commit to next sprint.",
  "pm-burndown": "Tracking remaining work is how a team sees, mid-sprint, whether it's on pace to finish.",
  "pm-fte": "FTE converts messy hours into whole people, the unit budgets and staffing plans are written in.",
  "pm-cost-per-point": "Cost per point turns spend into a unit rate you can compare across teams and quarters.",
  "pm-sprints-left": "Dividing remaining work by velocity gives the completion forecast stakeholders always ask for.",
  "pm-sv": "Schedule Variance says, in value terms, whether you're ahead of or behind plan — the schedule twin of cost variance.",
  "pm-etc": "ETC is how much more money you need to ask for — the practical follow-up to the forecast.",
  "pm-vac": "VAC states, in dollars, how far over or under budget the project is projected to land.",
  "pm-tcpi": "TCPI is a reality check: the efficiency the remaining work must hit to still finish on budget.",
  "pm-roi": "ROI is the first number that decides whether a project is worth funding at all.",
  "pm-npv": "NPV accounts for the time value of money — the standard way to compare investments with different timings.",
  "pm-payback": "Payback period is the quick 'how soon do we break even?' test every sponsor wants answered.",
  "pm-breakeven": "Break-even analysis is the classic go/no-go number: how many units you must sell to stop losing money.",

  // ---- Core Python: added fundamentals ----
  "b-while": "while loops repeat until a condition changes — essential when you don't know the count ahead of time (reading input, retrying, searching).",
  "b-sets": "Sets make 'is it unique?' and 'is it in here?' instant — the go-to for de-duplicating and fast membership tests.",
  "b-convert": "Input from users and files arrives as text; converting it to numbers is a step almost every real program needs.",
  "b-defaults": "Default and keyword arguments make functions flexible and self-documenting — you see this in nearly every library.",
  "b-range": "range drives counted loops and number sequences; knowing the stop is excluded prevents classic off-by-one bugs.",
  "i-slicing": "Slicing grabs sublists and substrings cleanly — used constantly for trimming, windows, and reversing.",
  "i-nested": "Real data is nested (rows of records = a list of dicts); pulling fields out of it is everyday data work.",
  "i-enumerate": "enumerate and zip replace clumsy index bookkeeping — cleaner loops over numbered items and paired sequences.",
  "i-dictcomp": "Dict comprehensions build lookups and mappings in one readable line — a staple of idiomatic Python.",
  "i-lambda": "A lambda key is how you sort or rank by any rule you like — one of the most common real-world uses of functions.",
  "i-mutability": "Mutable lists shared by reference cause some of Python's nastiest bugs; knowing when you copy vs. mutate saves hours.",
  "e-inheritance": "Inheritance and polymorphism let many types share one interface — the backbone of frameworks and large codebases.",
  "e-exceptions2": "Raising your own errors makes a function fail loudly and clearly at the boundary instead of returning bad data silently.",
  "e-closures": "Closures capture state without a class — the idea behind decorators, callbacks, and many functional patterns.",
  "e-context": "Context managers guarantee cleanup (files closed, locks released) even when errors happen — the 'with' you'll use daily.",
  "e-flatten": "Nested comprehensions flatten and transform 2-D data in one expression — concise and fast.",

  // ---- Practice Gym ----
  "pg-reverse": "A quick slicing drill — reversing strings shows up in palindromes, parsing, and formatting.",
  "pg-count-char": "Counting occurrences is a fundamental string operation behind search and validation.",
  "pg-title": "Formatting names and titles correctly is a common real-world text task.",
  "pg-anagram": "Anagram checking drills sorting and normalization — a classic text-processing exercise.",
  "pg-count-words": "Counting words underlies search, summaries, and readability metrics.",
  "pg-remove-vowels": "Filtering characters is a building block for cleaning and transforming text.",
  "pg-total": "Summing with a loop cements how accumulation works before you reach for built-ins.",
  "pg-max": "Finding the max by hand shows how comparison and tracking-the-best works — the core of many algorithms.",
  "pg-dedupe": "Order-preserving de-duplication is a real task (clean lists, unique visitors) and drills sets + loops together.",
  "pg-running": "Running totals power dashboards, budgets, and cumulative charts.",
  "pg-chunk": "Chunking splits work into batches — used for pagination, batching API calls, and grids.",
  "pg-second-largest": "Finding the runner-up drills sets and sorting, and shows why 'distinct' matters.",
  "pg-fizzbuzz": "The classic warm-up — practices loops, modulo, and branching all at once.",
  "pg-prime": "Primality testing drills loops with an early exit, and introduces efficiency (stop at the square root).",
  "pg-gcd": "Euclid's algorithm is elegant and practical (reducing fractions, tiling) and drills the while loop.",
  "pg-digit-sum": "Digit sums appear in checksums and puzzles, and drill converting numbers to strings and back.",
  "pg-leap": "Leap-year logic is a compact test of chained boolean conditions — easy to get subtly wrong.",
  "pg-collatz": "The Collatz sequence is a fun loop-until-done drill with simple rules and surprising behavior.",
  "pg-word-freq": "Frequency counts are the backbone of search, analytics, and text processing.",
  "pg-invert": "Inverting a mapping is a common trick — turning a lookup around to search the other way.",
  "pg-common-keys": "Finding shared keys drills set operations, which make overlap and membership questions fast.",
  "pg-group-parity": "Grouping items by a rule is the pattern behind bucketing, bucketed reports, and dispatch.",
  "pg-merge-dicts": "Merging dicts is everyday config work — layering defaults with overrides.",
  "pg-sym-diff": "Symmetric difference answers 'what changed?' between two sets — diffs, sync, and reconciliation.",
  "pg-most-common": "Finding the most frequent value powers 'top item' features across analytics and recommendations.",
  "pg-squares": "A clean comprehension drill — the idiomatic way Python builds lists from a rule.",
  "pg-filter-even": "Filtering with a condition inside a comprehension is one of Python's most-used patterns.",
  "pg-to-dict": "Zipping two lists into a dict is a constant move when pairing labels with values.",
  "pg-apply-all": "Passing functions as arguments (higher-order functions) unlocks map/filter and callback patterns.",
  "pg-compose": "Function composition is a core functional-programming idea used in pipelines and decorators.",
  "pg-count-if": "Counting by predicate generalizes to filtering, validation, and quick data summaries.",
  "pg-point": "A class with data and a method is the fundamental object-oriented building block.",
  "pg-stack": "Implementing a stack teaches the LIFO structure behind undo, parsing, and call stacks.",
  "pg-safe-divide": "Catching exceptions to return a safe default is defensive coding you'll use constantly.",
  "pg-validate-age": "Raising on bad input keeps invalid data out of your program at the boundary.",
  "pg-sum-rec": "Recursion drilled on a simple sum builds intuition for trees, traversals, and divide-and-conquer.",
  "pg-power-rec": "Recursive power reinforces base cases and self-calls — the mental model behind all recursion.",

  // ---- Projects ----
  "proj-guess": "The decision logic at the heart of a guessing game — your first taste of turning rules into a small program.",
  "proj-temp": "A practical converter that ties formulas to functions — the kind of tool utilities are made of.",
  "proj-password": "Encoding real-world rules (length, character variety) into code is exactly what validation does everywhere.",
  "proj-tally": "Counting and picking a winner combines dictionaries and loops — the core of polls, elections, and analytics.",
  "proj-wordstats": "A mini text-analytics tool combining splitting, sets, and tracking-the-best in one function.",
  "proj-todo": "A to-do manager is a classic first app — it ties objects, state, and filtering together.",
  "proj-bank": "An account with overdraft protection practices classes, state, and guarding against invalid operations.",
  "proj-tictactoe": "Detecting a winner drills nested lists and systematic checking — the logic behind board games.",
  "proj-roman": "Roman-numeral conversion is a satisfying greedy-algorithm project combining loops and a lookup table.",
  "proj-rps": "Encoding the rules of a game into a winner function is a clean intro to decision logic.",
  "proj-mask-word": "Building the hangman display drills strings and set membership in a real game context.",
  "proj-caesar": "A Caesar cipher is a classic first encryption project — character math with wrap-around.",
  "proj-longest-streak": "Tracking the longest run is the pattern behind win streaks, uptime, and habit trackers.",
  "proj-magic": "Validating a magic square drills grids, sums, and diagonals — systematic checking of 2-D data.",
  "proj-dice-pair": "Detecting duplicates with a set is a fast, idiomatic trick you'll reuse constantly.",
  "proj-guess-feedback": "Turning guesses into hints combines comparison and list-building — the core of a guessing game.",
  "proj-count-vowels": "Counting characters by a rule is a foundational text-processing skill.",
  "proj-palindrome": "Palindrome checking drills string cleaning and reversal — a beloved beginner challenge.",
  "proj-acronym": "Building acronyms practices splitting text and pulling out first characters.",
  "proj-word-lengths": "Mapping words to lengths is a small step toward real text analytics.",
  "proj-censor": "Word censoring is practical string replacement with length-aware masking.",
  "proj-initials": "Formatting initials drills splitting, indexing, and joining into a specific shape.",
  "proj-longest-word": "Finding the longest word reinforces the track-the-best loop over text.",
  "proj-tip": "A tip calculator is the simplest useful money tool — percentages applied to a total.",
  "proj-split-bill": "Splitting a bill adds rounding to cents — the reality of working with money.",
  "proj-hms": "Formatting seconds as HH:MM:SS drills integer math and zero-padded output.",
  "proj-cart": "Totaling a cart of price×quantity is the calculation behind every checkout.",
  "proj-discount": "Applying discounts is everyday pricing logic used in any store or app.",
  "proj-grade": "Mapping scores to letter grades practices ordered if/elif branching.",
  "proj-bmi": "A BMI calculator ties a real formula to rounding — a compact health-utility build.",
  "proj-running-max": "Running maxima power high-water marks, records, and streaming statistics.",
  "proj-median": "Computing the median drills sorting and even/odd handling — a core statistic.",
  "proj-topk": "Top-K frequent items is the engine behind trending lists and recommendations.",
  "proj-passing-rate": "Pass rates turn raw scores into the percentages reports actually show.",
  "proj-count-range": "Counting values in a range is the basis of histograms and filtering.",
  "proj-transpose": "Transposing a matrix drills nested data and the zip trick — key for tables and grids.",
  "proj-rle": "Run-length encoding is a real compression technique and a great loop-with-state exercise."
};
