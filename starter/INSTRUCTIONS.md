# Copilot Instructions for Sudoku Project

## Project Structure
- Keep the Flask starter layout and routes
- All Python code stays in `sudoku_logic.py` and `app.py`
- Frontend files are in `static/` and `templates/`

## Game Requirements
- **Difficulty Levels**: Easy (40+ prefilled), Medium (30-40), Hard (20-30)
- **Unique Solution**: Every generated puzzle must have exactly one solution
- **Locked Prefills**: Prefilled cells cannot be edited by the user
- **Hint Button**: Fills one correct empty cell and locks it
- **Check Button**: Highlights incorrect entries in red
- **Timer**: Tracks time in MM:SS format, starts when puzzle loads
- **Dark Mode**: Toggle between light and dark themes for the entire UI

## Top 10 Scoreboard (localStorage)
- Store: Player Name, Completion Time, Difficulty Level, Hints Used
- Display top 10 fastest times sorted by time
- Save automatically when a puzzle is completed

## Styling Requirements
- **3×3 Box Colors**: Use a checkerboard pattern for the 9 boxes
  - Formula: `(floor(row/3) + floor(col/3)) % 2` for alternating colors
  - Two clearly different colors that work in both light and dark modes
- **Responsive**: Works on desktop and mobile
- **No Layout Shifts**: Elements should not jump around

## Example Prompts to Use with Copilot
1. "Help me add a difficulty selector with Easy, Medium, Hard options."
2. "Ensure each generated puzzle has a unique solution."
3. "Add a hint button that fills one correct empty cell and locks it."
4. "Store top 10 scores in localStorage with name, time, difficulty, and hints."
5. "Style the 3x3 squares with alternating checkerboard colors."