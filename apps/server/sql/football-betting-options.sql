-- 胜平负和让球胜平负的选项
INSERT INTO football_betting_option (id, betting_type, code, sort) VALUES
(UUID(), 'win_lose_draw', '胜', 1),
(UUID(), 'win_lose_draw', '平', 2),
(UUID(), 'win_lose_draw', '负', 3),
(UUID(), 'handicap_win_lose_draw', '让胜', 1),
(UUID(), 'handicap_win_lose_draw', '让平', 2),
(UUID(), 'handicap_win_lose_draw', '让负', 3);

-- 半全场胜平负的选项（9种组合）
INSERT INTO football_betting_option (id, betting_type, code, sort) VALUES
(UUID(), 'half_full_time_win_lose_draw', '胜胜', 1),
(UUID(), 'half_full_time_win_lose_draw', '胜平', 2),
(UUID(), 'half_full_time_win_lose_draw', '胜负', 3),
(UUID(), 'half_full_time_win_lose_draw', '平胜', 4),
(UUID(), 'half_full_time_win_lose_draw', '平平', 5),
(UUID(), 'half_full_time_win_lose_draw', '平负', 6),
(UUID(), 'half_full_time_win_lose_draw', '负胜', 7),
(UUID(), 'half_full_time_win_lose_draw', '负平', 8),
(UUID(), 'half_full_time_win_lose_draw', '负负', 9);

-- 比分的选项
INSERT INTO football_betting_option (id, betting_type, code, sort) VALUES
-- 胜的比分
(UUID(), 'score', '1:0', 1),
(UUID(), 'score', '2:0', 2),
(UUID(), 'score', '2:1', 3),
(UUID(), 'score', '3:0', 4),
(UUID(), 'score', '3:1', 5),
(UUID(), 'score', '3:2', 6),
(UUID(), 'score', '4:0', 7),
(UUID(), 'score', '4:1', 8),
(UUID(), 'score', '4:2', 9),
(UUID(), 'score', '5:0', 10),
(UUID(), 'score', '5:1', 11),
(UUID(), 'score', '5:2', 12),
(UUID(), 'score', '胜其他', 13),
-- 平的比分
(UUID(), 'score', '0:0', 14),
(UUID(), 'score', '1:1', 15),
(UUID(), 'score', '2:2', 16),
(UUID(), 'score', '3:3', 17),
(UUID(), 'score', '平其他', 18),
-- 负的比分
(UUID(), 'score', '0:1', 19),
(UUID(), 'score', '0:2', 20),
(UUID(), 'score', '1:2', 21),
(UUID(), 'score', '0:3', 22),
(UUID(), 'score', '1:3', 23),
(UUID(), 'score', '2:3', 24),
(UUID(), 'score', '0:4', 25),
(UUID(), 'score', '1:4', 26),
(UUID(), 'score', '2:4', 27),
(UUID(), 'score', '0:5', 28),
(UUID(), 'score', '1:5', 29),
(UUID(), 'score', '2:5', 30),
(UUID(), 'score', '负其他', 31);

-- 总进球的选项
INSERT INTO football_betting_option (id, betting_type, code, sort) VALUES
(UUID(), 'total_goals', '0', 1),
(UUID(), 'total_goals', '1', 2),
(UUID(), 'total_goals', '2', 3),
(UUID(), 'total_goals', '3', 4),
(UUID(), 'total_goals', '4', 5),
(UUID(), 'total_goals', '5', 6),
(UUID(), 'total_goals', '6', 7),
(UUID(), 'total_goals', '7+', 8);