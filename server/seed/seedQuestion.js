require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const TestCase = require('../models/TestCase');

// 50 questions across topics: Arrays, Strings, Trees, Graphs, DP, Sorting,
// Searching, Stack, Queue, LinkedList, Hashing, Greedy, Backtracking,
// Bit Manipulation, Math, Recursion, Two Pointers, Sliding Window, Heap, Trie
const questionsData = [
  { title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy', statement: 'Given an array of integers and a target value, return the indices of the two numbers that add up to the target.', sampleInput: '4\n2 7 11 15\n9', sampleOutput: '0 1' },
  { title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'Easy', statement: 'Given an array of prices where prices[i] is the price on day i, find the maximum profit from a single buy and sell.', sampleInput: '6\n7 1 5 3 6 4', sampleOutput: '5' },
  { title: 'Maximum Subarray', topic: 'Arrays', difficulty: 'Medium', statement: 'Find the contiguous subarray with the largest sum and return its sum.', sampleInput: '9\n-2 1 -3 4 -1 2 1 -5 4', sampleOutput: '6' },
  { title: 'Product of Array Except Self', topic: 'Arrays', difficulty: 'Medium', statement: 'Given an array, return an array where each element is the product of all other elements, without using division.', sampleInput: '4\n1 2 3 4', sampleOutput: '24 12 8 6' },
  { title: 'Merge Intervals', topic: 'Arrays', difficulty: 'Medium', statement: 'Given a collection of intervals, merge all overlapping intervals.', sampleInput: '4\n1 3\n2 6\n8 10\n15 18', sampleOutput: '1 6\n8 10\n15 18' },
  { title: 'Rotate Array', topic: 'Arrays', difficulty: 'Medium', statement: 'Rotate an array to the right by k steps.', sampleInput: '7\n1 2 3 4 5 6 7\n3', sampleOutput: '5 6 7 1 2 3 4' },
  { title: 'Find Minimum in Rotated Sorted Array', topic: 'Arrays', difficulty: 'Medium', statement: 'Find the minimum element in a rotated sorted array with no duplicates.', sampleInput: '5\n4 5 6 7 0 1 2', sampleOutput: '0' },
  { title: 'Trapping Rain Water', topic: 'Arrays', difficulty: 'Hard', statement: 'Given elevation heights, compute how much water can be trapped after raining.', sampleInput: '12\n0 1 0 2 1 0 1 3 2 1 2 1', sampleOutput: '6' },

  { title: 'Valid Anagram', topic: 'Strings', difficulty: 'Easy', statement: 'Given two strings, determine if the second is an anagram of the first.', sampleInput: 'anagram\nnagaram', sampleOutput: 'true' },
  { title: 'Valid Palindrome', topic: 'Strings', difficulty: 'Easy', statement: 'Determine if a string is a palindrome, considering only alphanumeric characters and ignoring case.', sampleInput: 'A man, a plan, a canal: Panama', sampleOutput: 'true' },
  { title: 'Longest Substring Without Repeating Characters', topic: 'Strings', difficulty: 'Medium', statement: 'Find the length of the longest substring without repeating characters.', sampleInput: 'abcabcbb', sampleOutput: '3' },
  { title: 'Group Anagrams', topic: 'Strings', difficulty: 'Medium', statement: 'Group an array of strings into anagram groups.', sampleInput: '6\neat tea tan ate nat bat', sampleOutput: '[eat,tea,ate] [tan,nat] [bat]' },
  { title: 'Longest Palindromic Substring', topic: 'Strings', difficulty: 'Medium', statement: 'Return the longest palindromic substring in a given string.', sampleInput: 'babad', sampleOutput: 'bab' },
  { title: 'String to Integer (atoi)', topic: 'Strings', difficulty: 'Medium', statement: 'Implement atoi to convert a string to a 32-bit signed integer, following standard rules.', sampleInput: '   -42', sampleOutput: '-42' },
  { title: 'Minimum Window Substring', topic: 'Strings', difficulty: 'Hard', statement: 'Given strings s and t, find the minimum window in s which contains all characters of t.', sampleInput: 'ADOBECODEBANC\nABC', sampleOutput: 'BANC' },

  { title: 'Binary Tree Inorder Traversal', topic: 'Trees', difficulty: 'Easy', statement: 'Given the root of a binary tree, return the inorder traversal of node values.', sampleInput: '1 null 2 3', sampleOutput: '1 3 2' },
  { title: 'Maximum Depth of Binary Tree', topic: 'Trees', difficulty: 'Easy', statement: 'Given the root of a binary tree, return its maximum depth.', sampleInput: '3 9 20 null null 15 7', sampleOutput: '3' },
  { title: 'Same Tree', topic: 'Trees', difficulty: 'Easy', statement: 'Given two binary trees, check if they are structurally identical with the same node values.', sampleInput: '1 2 3\n1 2 3', sampleOutput: 'true' },
  { title: 'Validate Binary Search Tree', topic: 'Trees', difficulty: 'Medium', statement: 'Determine if a given binary tree is a valid binary search tree.', sampleInput: '2 1 3', sampleOutput: 'true' },
  { title: 'Level Order Traversal', topic: 'Trees', difficulty: 'Medium', statement: 'Given a binary tree, return the level order traversal of its node values.', sampleInput: '3 9 20 null null 15 7', sampleOutput: '3\n9 20\n15 7' },
  { title: 'Lowest Common Ancestor of a Binary Tree', topic: 'Trees', difficulty: 'Medium', statement: 'Find the lowest common ancestor of two given nodes in a binary tree.', sampleInput: '3 5 1 6 2 0 8\n5 1', sampleOutput: '3' },
  { title: 'Serialize and Deserialize Binary Tree', topic: 'Trees', difficulty: 'Hard', statement: 'Design an algorithm to serialize and deserialize a binary tree.', sampleInput: '1 2 3 null null 4 5', sampleOutput: '1 2 3 null null 4 5' },
  { title: 'Binary Tree Maximum Path Sum', topic: 'Trees', difficulty: 'Hard', statement: 'Find the maximum path sum between any two nodes in a binary tree.', sampleInput: '-10 9 20 null null 15 7', sampleOutput: '42' },

  { title: 'Number of Islands', topic: 'Graphs', difficulty: 'Medium', statement: 'Given a 2D grid of 1s (land) and 0s (water), count the number of islands.', sampleInput: '3 3\n1 1 0\n1 1 0\n0 0 1', sampleOutput: '2' },
  { title: 'Clone Graph', topic: 'Graphs', difficulty: 'Medium', statement: 'Given a reference to a node in a connected undirected graph, return a deep copy of the graph.', sampleInput: '1-2 1-4 2-3 3-4', sampleOutput: '1-2 1-4 2-3 3-4' },
  { title: 'Course Schedule', topic: 'Graphs', difficulty: 'Medium', statement: 'Given a number of courses and prerequisite pairs, determine if it is possible to finish all courses (detect cycle).', sampleInput: '2\n1 0', sampleOutput: 'true' },
  { title: 'Pacific Atlantic Water Flow', topic: 'Graphs', difficulty: 'Medium', statement: 'Given a grid of heights, find cells from which water can flow to both the Pacific and Atlantic oceans.', sampleInput: '4 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4', sampleOutput: '(0,4) (1,3) (1,4) (2,2) (3,0) (3,1) (4,0)' },
  { title: 'Word Ladder', topic: 'Graphs', difficulty: 'Hard', statement: 'Given a begin word, end word, and word list, find the length of the shortest transformation sequence.', sampleInput: 'hit\ncog\nhot dot dog lot log cog', sampleOutput: '5' },
  { title: 'Alien Dictionary', topic: 'Graphs', difficulty: 'Hard', statement: 'Given a list of words sorted lexicographically by an alien language rule, derive the order of letters.', sampleInput: '3\nwrt wrf er ett rftt', sampleOutput: 'wertf' },

  { title: 'Climbing Stairs', topic: 'DP', difficulty: 'Easy', statement: 'Given n steps, find the number of distinct ways to climb to the top taking 1 or 2 steps at a time.', sampleInput: '3', sampleOutput: '3' },
  { title: 'House Robber', topic: 'DP', difficulty: 'Medium', statement: 'Given an array of house values, find the maximum amount you can rob without robbing two adjacent houses.', sampleInput: '4\n1 2 3 1', sampleOutput: '4' },
  { title: 'Coin Change', topic: 'DP', difficulty: 'Medium', statement: 'Given coin denominations and a target amount, find the fewest number of coins needed to make the amount.', sampleInput: '3\n1 2 5\n11', sampleOutput: '3' },
  { title: 'Longest Increasing Subsequence', topic: 'DP', difficulty: 'Medium', statement: 'Given an integer array, return the length of the longest strictly increasing subsequence.', sampleInput: '8\n10 9 2 5 3 7 101 18', sampleOutput: '4' },
  { title: 'Longest Common Subsequence', topic: 'DP', difficulty: 'Medium', statement: 'Given two strings, find the length of their longest common subsequence.', sampleInput: 'abcde\nace', sampleOutput: '3' },
  { title: 'Word Break', topic: 'DP', difficulty: 'Medium', statement: 'Given a string and a dictionary of words, determine if the string can be segmented into a space-separated sequence of dictionary words.', sampleInput: 'leetcode\nleet code', sampleOutput: 'true' },
  { title: 'Unique Paths', topic: 'DP', difficulty: 'Medium', statement: 'Find the number of unique paths from top-left to bottom-right of an m x n grid, moving only right or down.', sampleInput: '3 7', sampleOutput: '28' },
  { title: '0/1 Knapsack', topic: 'DP', difficulty: 'Hard', statement: 'Given item weights, values, and a capacity, find the maximum value achievable without exceeding capacity.', sampleInput: '3 50\n10 20 30\n60 100 120', sampleOutput: '220' },
  { title: 'Edit Distance', topic: 'DP', difficulty: 'Hard', statement: 'Given two strings, find the minimum number of operations to convert one into the other.', sampleInput: 'horse\nros', sampleOutput: '3' },

  { title: 'Merge Sort', topic: 'Sorting', difficulty: 'Medium', statement: 'Implement merge sort to sort an array of integers in ascending order.', sampleInput: '5\n5 2 4 1 3', sampleOutput: '1 2 3 4 5' },
  { title: 'Quick Sort', topic: 'Sorting', difficulty: 'Medium', statement: 'Implement quick sort to sort an array of integers in ascending order.', sampleInput: '5\n5 2 4 1 3', sampleOutput: '1 2 3 4 5' },
  { title: 'Kth Largest Element in an Array', topic: 'Sorting', difficulty: 'Medium', statement: 'Find the kth largest element in an unsorted array.', sampleInput: '6\n3 2 1 5 6 4\n2', sampleOutput: '5' },

  { title: 'Binary Search', topic: 'Searching', difficulty: 'Easy', statement: 'Given a sorted array and a target value, return the index of the target using binary search.', sampleInput: '6\n-1 0 3 5 9 12\n9', sampleOutput: '4' },
  { title: 'Search in Rotated Sorted Array', topic: 'Searching', difficulty: 'Medium', statement: 'Given a rotated sorted array and a target, find the index of the target in O(log n) time.', sampleInput: '7\n4 5 6 7 0 1 2\n0', sampleOutput: '4' },

  { title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', statement: 'Given a string of brackets, determine if the input string is valid (properly matched and nested).', sampleInput: '()[]{}', sampleOutput: 'true' },
  { title: 'Min Stack', topic: 'Stack', difficulty: 'Medium', statement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.', sampleInput: 'push(-2) push(0) push(-3) getMin() pop() top() getMin()', sampleOutput: '-3 0 -2' },
  { title: 'Daily Temperatures', topic: 'Stack', difficulty: 'Medium', statement: 'Given daily temperatures, return an array where each element is the number of days to wait for a warmer temperature.', sampleInput: '6\n73 74 75 71 69 72', sampleOutput: '1 1 4 2 1 0' },

  { title: 'Implement Queue using Stacks', topic: 'Queue', difficulty: 'Easy', statement: 'Implement a FIFO queue using only two stacks.', sampleInput: 'push(1) push(2) peek() pop() empty()', sampleOutput: '1 1 false' },
  { title: 'Sliding Window Maximum', topic: 'Sliding Window', difficulty: 'Hard', statement: 'Given an array and window size k, return the maximum value in each sliding window.', sampleInput: '8\n1 3 -1 -3 5 3 6 7\n3', sampleOutput: '3 3 5 5 6 7' },

  { title: 'Reverse Linked List', topic: 'LinkedList', difficulty: 'Easy', statement: 'Given the head of a singly linked list, reverse the list and return the new head.', sampleInput: '1 2 3 4 5', sampleOutput: '5 4 3 2 1' },
  { title: 'Detect Cycle in Linked List', topic: 'LinkedList', difficulty: 'Easy', statement: 'Given a linked list, determine if it has a cycle.', sampleInput: '3 2 0 -4 (cycle at pos 1)', sampleOutput: 'true' },
  { title: 'Merge Two Sorted Lists', topic: 'LinkedList', difficulty: 'Easy', statement: 'Merge two sorted linked lists into a single sorted list.', sampleInput: '1 2 4\n1 3 4', sampleOutput: '1 1 2 3 4 4' },

  { title: 'Contains Duplicate', topic: 'Hashing', difficulty: 'Easy', statement: 'Given an array, determine if any value appears at least twice.', sampleInput: '4\n1 2 3 1', sampleOutput: 'true' },
  { title: 'Top K Frequent Elements', topic: 'Hashing', difficulty: 'Medium', statement: 'Given an array of integers, return the k most frequent elements.', sampleInput: '6\n1 1 1 2 2 3\n2', sampleOutput: '1 2' },

  { title: 'Jump Game', topic: 'Greedy', difficulty: 'Medium', statement: 'Given an array where each element represents max jump length, determine if you can reach the last index.', sampleInput: '5\n2 3 1 1 4', sampleOutput: 'true' },
  { title: 'Gas Station', topic: 'Greedy', difficulty: 'Medium', statement: 'Given gas and cost arrays for a circular route, find the starting index to complete the circuit, or -1.', sampleInput: '5\n1 2 3 4 5\n3 4 5 1 2', sampleOutput: '3' },

  { title: 'Subsets', topic: 'Backtracking', difficulty: 'Medium', statement: 'Given an array of distinct integers, return all possible subsets (the power set).', sampleInput: '3\n1 2 3', sampleOutput: '[] [1] [2] [1,2] [3] [1,3] [2,3] [1,2,3]' },
  { title: 'Permutations', topic: 'Backtracking', difficulty: 'Medium', statement: 'Given an array of distinct integers, return all possible permutations.', sampleInput: '3\n1 2 3', sampleOutput: '[1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]' },
  { title: 'N-Queens', topic: 'Backtracking', difficulty: 'Hard', statement: 'Place n queens on an n x n chessboard so no two queens attack each other. Return all valid arrangements.', sampleInput: '4', sampleOutput: '2 solutions' },

  { title: 'Single Number', topic: 'Bit Manipulation', difficulty: 'Easy', statement: 'Given an array where every element appears twice except one, find that single element.', sampleInput: '5\n4 1 2 1 2', sampleOutput: '4' },
  { title: 'Number of 1 Bits', topic: 'Bit Manipulation', difficulty: 'Easy', statement: 'Given an unsigned integer, return the number of 1 bits in its binary representation.', sampleInput: '11', sampleOutput: '3' },

  { title: 'FizzBuzz', topic: 'Math', difficulty: 'Easy', statement: 'Print numbers 1 to n, replacing multiples of 3 with Fizz, multiples of 5 with Buzz, and multiples of both with FizzBuzz.', sampleInput: '5', sampleOutput: '1 2 Fizz 4 Buzz' },
  { title: 'Reverse Integer', topic: 'Math', difficulty: 'Medium', statement: 'Given a 32-bit signed integer, reverse its digits. Return 0 if it overflows.', sampleInput: '123', sampleOutput: '321' },
  { title: 'Pow(x, n)', topic: 'Math', difficulty: 'Medium', statement: 'Implement pow(x, n), which calculates x raised to the power n.', sampleInput: '2.0\n10', sampleOutput: '1024.0' },

  { title: 'Fibonacci Number', topic: 'Recursion', difficulty: 'Easy', statement: 'Given n, calculate the nth Fibonacci number.', sampleInput: '6', sampleOutput: '8' },
  { title: 'Generate Parentheses', topic: 'Recursion', difficulty: 'Medium', statement: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses.', sampleInput: '3', sampleOutput: '((())) (()()) (())() ()(()) ()()()' },

  { title: 'Container With Most Water', topic: 'Two Pointers', difficulty: 'Medium', statement: 'Given heights of vertical lines, find two lines that together with the x-axis form the container holding the most water.', sampleInput: '9\n1 8 6 2 5 4 8 3 7', sampleOutput: '49' },
  { title: '3Sum', topic: 'Two Pointers', difficulty: 'Medium', statement: 'Given an array, find all unique triplets that sum to zero.', sampleInput: '6\n-1 0 1 2 -1 -4', sampleOutput: '[-1,-1,2] [-1,0,1]' },

  { title: 'Kth Largest Element in a Stream', topic: 'Heap', difficulty: 'Easy', statement: 'Design a class to find the kth largest element in a stream of numbers.', sampleInput: '3\n4 5 8 2\nadd(3) add(5)', sampleOutput: '4 5' },
  { title: 'Merge K Sorted Lists', topic: 'Heap', difficulty: 'Hard', statement: 'Given k sorted linked lists, merge them into one sorted list.', sampleInput: '1 4 5\n1 3 4\n2 6', sampleOutput: '1 1 2 3 4 4 5 6' },

  { title: 'Implement Trie (Prefix Tree)', topic: 'Trie', difficulty: 'Medium', statement: 'Implement a trie with insert, search, and startsWith methods.', sampleInput: 'insert(apple) search(apple) search(app) startsWith(app)', sampleOutput: 'true false true' },
  { title: 'Word Search II', topic: 'Trie', difficulty: 'Hard', statement: 'Given a board of characters and a list of words, find all words that exist on the board using a trie.', sampleInput: '4x4 board\nwords: oath pea eat rain', sampleOutput: 'oath eat' }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    await Question.deleteMany({});
    await TestCase.deleteMany({});
    console.log('Old data cleared');

    const inserted = await Question.insertMany(questionsData);
    console.log(`${inserted.length} questions inserted`);

    // Add 2 sample testcases (1 visible + 1 hidden) per question,
    // reusing sampleInput/sampleOutput so every problem is testable immediately
    const testCasesToInsert = [];
    inserted.forEach((q) => {
      testCasesToInsert.push({
        questionId: q._id,
        input: q.sampleInput,
        output: q.sampleOutput,
        hidden: false
      });
      testCasesToInsert.push({
        questionId: q._id,
        input: q.sampleInput,
        output: q.sampleOutput,
        hidden: true
      });
    });

    await TestCase.insertMany(testCasesToInsert);
    console.log(`${testCasesToInsert.length} testcases inserted`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();