import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cosineSimilarity } from '../../src/services/rag.service';

describe('AI RAG Service Unit Tests', () => {
  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2, 3];
      const sim = cosineSimilarity(vecA, vecB);
      expect(sim).toBeCloseTo(1, 4);
    });

    it('returns 0 for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const sim = cosineSimilarity(vecA, vecB);
      expect(sim).toBeCloseTo(0, 4);
    });

    it('returns 0 for empty or mismatched vectors', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });

    it('calculates proper cosine similarity for non-trivial vectors', () => {
      const vecA = [1, 1, 0];
      const vecB = [1, 0, 0];
      // dot = 1, normA = sqrt(2), normB = 1 -> sim = 1 / sqrt(2) ≈ 0.7071
      const sim = cosineSimilarity(vecA, vecB);
      expect(sim).toBeCloseTo(0.7071, 3);
    });
  });
});
