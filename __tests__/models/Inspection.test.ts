import { createMockInspection } from "../utils/mockDatabase";

describe("Inspection Model", () => {
  describe("scoreCategory getter", () => {
    it("should return correct category for each score range", () => {
      const excellentInspection = createMockInspection({ score: 9 });
      const goodInspection = createMockInspection({ score: 7 });
      const fairInspection = createMockInspection({ score: 5 });
      const poorInspection = createMockInspection({ score: 3 });
      const criticalInspection = createMockInspection({ score: 1 });

      expect(excellentInspection.scoreCategory).toBe("excellent");
      expect(goodInspection.scoreCategory).toBe("good");
      expect(fairInspection.scoreCategory).toBe("fair");
      expect(poorInspection.scoreCategory).toBe("poor");
      expect(criticalInspection.scoreCategory).toBe("critical");
    });
  });

  describe("isOverdue getter", () => {
    it("should return true when next due date is in the past", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const overdueInspection = createMockInspection({
        nextDue: pastDate,
        isOverdue: true,
      });

      expect(overdueInspection.isOverdue).toBe(true);
    });

    it("should return false when next due date is in the future", () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const notOverdueInspection = createMockInspection({
        nextDue: futureDate,
        isOverdue: false,
      });

      expect(notOverdueInspection.isOverdue).toBe(false);
    });

    it("should return false when no next due date is set", () => {
      const noDateInspection = createMockInspection({
        nextDue: undefined,
        isOverdue: false,
      });

      expect(noDateInspection.isOverdue).toBe(false);
    });
  });

  describe("daysUntilDue getter", () => {
    it("should return null when no next due date is set", () => {
      const inspection = createMockInspection({
        nextDue: undefined,
        daysUntilDue: null,
      });

      expect(inspection.daysUntilDue).toBe(null);
    });

    it("should return positive number for future dates", () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const inspection = createMockInspection({
        nextDue: futureDate,
        daysUntilDue: 7,
      });

      expect(inspection.daysUntilDue).toBe(7);
    });
  });

  describe("scheduleNextInspection", () => {
    it("should schedule inspection for specified days from now", async () => {
      const mockUpdate = jest.fn();
      const inspection = createMockInspection({
        update: mockUpdate,
        scheduleNextInspection: jest
          .fn()
          .mockImplementation(async function (this: any, daysFromNow: number) {
            const nextDueDate = new Date();
            nextDueDate.setDate(nextDueDate.getDate() + daysFromNow);

            await this.update((inspection: any) => {
              inspection.nextDue = nextDueDate;
              inspection.synced = false;
            });
          }),
      });

      await inspection.scheduleNextInspection(30);

      expect(inspection.scheduleNextInspection).toHaveBeenCalledWith(30);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("updateScore", () => {
    it("should update score and set maintenance flag for low scores", async () => {
      const mockUpdate = jest.fn();
      const inspection = createMockInspection({
        score: 8,
        update: mockUpdate,
        updateScore: jest.fn().mockImplementation(async function (this: any, newScore: number) {
          await this.update((inspection: any) => {
            inspection.score = Math.max(1, Math.min(10, newScore));
            inspection.maintenanceNeeded = newScore < 5;
            inspection.synced = false;
          });
        }),
      });

      await inspection.updateScore(3);

      expect(inspection.updateScore).toHaveBeenCalledWith(3);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("should clamp score to valid range (1-10)", async () => {
      const mockUpdate = jest.fn();
      const inspection = createMockInspection({
        update: mockUpdate,
        updateScore: jest.fn().mockImplementation(async function (this: any, newScore: number) {
          await this.update((inspection: any) => {
            inspection.score = Math.max(1, Math.min(10, newScore));
            inspection.maintenanceNeeded = newScore < 5;
            inspection.synced = false;
          });
        }),
      });

      // Test upper bound
      await inspection.updateScore(15);
      expect(inspection.updateScore).toHaveBeenCalledWith(15);

      // Test lower bound
      await inspection.updateScore(-5);
      expect(inspection.updateScore).toHaveBeenCalledWith(-5);
    });
  });

  describe("markMaintenanceComplete", () => {
    it("should mark maintenance as not needed and unsynced", async () => {
      const mockUpdate = jest.fn();
      const inspection = createMockInspection({
        maintenanceNeeded: true,
        update: mockUpdate,
        markMaintenanceComplete: jest.fn().mockImplementation(async function (this: any) {
          await this.update((inspection: any) => {
            inspection.maintenanceNeeded = false;
            inspection.synced = false;
          });
        }),
      });

      await inspection.markMaintenanceComplete();

      expect(inspection.markMaintenanceComplete).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
