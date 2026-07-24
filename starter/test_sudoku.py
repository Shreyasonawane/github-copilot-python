import copy

import sudoku_logic


VALID_BOARD = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
]


def test_create_empty_board_has_expected_shape():
    board = sudoku_logic.create_empty_board()

    assert len(board) == 9
    assert all(len(row) == 9 for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_board_generation_returns_9x9_puzzle_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=30)

    assert len(puzzle) == 9
    assert len(solution) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert all(len(row) == 9 for row in solution)
    assert puzzle != solution


def test_validates_rows_columns_and_squares():
    assert sudoku_logic.is_valid_board(VALID_BOARD)
    assert sudoku_logic.is_valid_row(VALID_BOARD, 0)
    assert sudoku_logic.is_valid_column(VALID_BOARD, 0)
    assert sudoku_logic.is_valid_square(VALID_BOARD, 0, 0)

    invalid_board = copy.deepcopy(VALID_BOARD)
    invalid_board[0][0] = invalid_board[0][1]

    assert not sudoku_logic.is_valid_row(invalid_board, 0)
    assert not sudoku_logic.is_valid_column(invalid_board, 0)
    assert not sudoku_logic.is_valid_square(invalid_board, 0, 0)
    assert not sudoku_logic.is_valid_board(invalid_board)


def test_can_place_number_only_when_it_is_safe():
    board = copy.deepcopy(VALID_BOARD)
    board[0][0] = 0

    assert sudoku_logic.can_place(board, 0, 0, 5) is True
    assert sudoku_logic.can_place(board, 0, 0, 7) is False


def test_solves_known_puzzle():
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 2],
        [6, 0, 2, 1, 0, 5, 3, 0, 8],
        [1, 9, 0, 0, 4, 2, 5, 0, 0],
        [8, 5, 0, 7, 6, 1, 0, 2, 0],
        [4, 0, 6, 8, 5, 3, 7, 0, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 0],
        [0, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 0, 1, 7, 9],
    ]

    assert sudoku_logic.solve_board(puzzle) is True
    assert sudoku_logic.is_valid_board(puzzle)
    assert puzzle == VALID_BOARD


def test_puzzles_have_a_unique_solution():
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 2],
        [6, 0, 2, 1, 0, 5, 3, 0, 8],
        [1, 9, 0, 0, 4, 2, 5, 0, 0],
        [8, 5, 0, 7, 6, 1, 0, 2, 0],
        [4, 0, 6, 8, 5, 3, 7, 0, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 0],
        [0, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 0, 1, 7, 9],
    ]

    assert sudoku_logic.has_unique_solution(puzzle) is True


def test_generate_puzzle_respects_difficulty_levels():
    for difficulty, min_clues, max_clues in [
        ("easy", 40, 81),
        ("medium", 30, 40),
        ("hard", 20, 30),
    ]:
        puzzle, solution = sudoku_logic.generate_puzzle(difficulty=difficulty)
        clues = sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)

        assert min_clues <= clues <= max_clues
        assert sudoku_logic.has_unique_solution(puzzle) is True
        assert puzzle != solution
