import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def _is_valid_board_shape(board):
    return isinstance(board, list) and len(board) == SIZE and all(
        isinstance(row, list) and len(row) == SIZE for row in board
    )


def is_safe(board, row, col, num):
    if not _is_valid_board_shape(board):
        return False
    if not (0 <= row < SIZE and 0 <= col < SIZE):
        return False
    if board[row][col] != EMPTY and board[row][col] != num:
        return False

    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def can_place(board, row, col, num):
    if not (0 <= row < SIZE and 0 <= col < SIZE):
        return False
    if board[row][col] != EMPTY:
        return False
    return is_safe(board, row, col, num)


def is_valid_row(board, row):
    if not _is_valid_board_shape(board):
        return False
    seen = set()
    for value in board[row]:
        if value == EMPTY:
            continue
        if not 1 <= value <= SIZE or value in seen:
            return False
        seen.add(value)
    return True


def is_valid_column(board, col):
    if not _is_valid_board_shape(board):
        return False
    seen = set()
    for row in range(SIZE):
        value = board[row][col]
        if value == EMPTY:
            continue
        if not 1 <= value <= SIZE or value in seen:
            return False
        seen.add(value)
    return True


def is_valid_square(board, row, col):
    if not _is_valid_board_shape(board):
        return False
    start_row = row - row % 3
    start_col = col - col % 3
    seen = set()
    for i in range(3):
        for j in range(3):
            value = board[start_row + i][start_col + j]
            if value == EMPTY:
                continue
            if not 1 <= value <= SIZE or value in seen:
                return False
            seen.add(value)
    return True


def is_valid_board(board):
    if not _is_valid_board_shape(board):
        return False

    for row in range(SIZE):
        if not is_valid_row(board, row):
            return False
    for col in range(SIZE):
        if not is_valid_column(board, col):
            return False
    for row in range(0, SIZE, 3):
        for col in range(0, SIZE, 3):
            if not is_valid_square(board, row, col):
                return False
    return True


def _find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def _solve_board_recursive(board):
    next_cell = _find_empty_cell(board)
    if next_cell is None:
        return True

    row, col = next_cell
    for candidate in range(1, SIZE + 1):
        if can_place(board, row, col, candidate):
            board[row][col] = candidate
            if _solve_board_recursive(board):
                return True
            board[row][col] = EMPTY
    return False


def solve_board(board):
    if not is_valid_board(board):
        return False
    return _solve_board_recursive(board)


def has_unique_solution(board):
    if not is_valid_board(board):
        return False

    solutions = 0

    def search(state):
        nonlocal solutions
        if solutions > 1:
            return

        next_cell = _find_empty_cell(state)
        if next_cell is None:
            solutions += 1
            return

        row, col = next_cell
        for candidate in range(1, SIZE + 1):
            if can_place(state, row, col, candidate):
                state[row][col] = candidate
                search(state)
                state[row][col] = EMPTY
                if solutions > 1:
                    return

    search(deep_copy(board))
    return solutions == 1


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if can_place(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def remove_cells(board, clues):
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(cells)
    target_empty = SIZE * SIZE - clues
    emptied = 0

    while emptied < target_empty and cells:
        row, col = cells.pop()
        if board[row][col] == EMPTY:
            continue

        original_value = board[row][col]
        board[row][col] = EMPTY
        if not has_unique_solution(board):
            board[row][col] = original_value
        else:
            emptied += 1


def generate_puzzle(clues=None, difficulty=None):
    if clues is None:
        if difficulty is None:
            clues = 35
        else:
            difficulty_name = str(difficulty).lower()
            clue_targets = {
                "easy": 45,
                "medium": 35,
                "hard": 25,
            }
            if difficulty_name not in clue_targets:
                raise ValueError("difficulty must be 'easy', 'medium', or 'hard'")
            clues = clue_targets[difficulty_name]

    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
