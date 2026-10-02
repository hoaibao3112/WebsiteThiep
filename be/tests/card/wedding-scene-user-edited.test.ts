import { describe, expect, it } from "vitest";
import {
  ensureWeddingScene,
  ensureWeddingSceneData,
  markUserEditedElements,
} from "../../src/services/wedding-scene.service";
import type { DraftCardInput } from "../../src/lib/validators/card";

describe("Mục 1: Wedding Scene Element userEdited & binding sync preservation", () => {
  const templateSlug = "wedding-cinematic-editorial";

  it("sửa content element bound có userEdited: true → GET lại phải giữ nguyên không bị đè bởi data.*", () => {
    // 1. Tạo initial data cho thiệp
    const initialData = {
      cardCategory: "WEDDING" as const,
      groom: { fullName: "Nguyễn Văn A" },
      bride: { fullName: "Trần Thị B" },
    };

    const sceneData = ensureWeddingSceneData(templateSlug, initialData);
    const canvasDoc = sceneData.canvasDocument as any;
    expect(canvasDoc).toBeDefined();

    // Tìm element liên kết với groom.fullName
    const bindings = canvasDoc.bindings as Record<string, string>;
    const groomElementId = Object.keys(bindings).find(
      (id) => bindings[id] === "groom.fullName"
    );
    expect(groomElementId).toBeDefined();

    const initialElement = canvasDoc.elements.find(
      (el: any) => el.id === groomElementId
    );
    expect(initialElement.content).toBe("Nguyễn Văn A");

    // 2. Giả lập PATCH/chỉnh sửa element: đổi content và gắn userEdited: true
    const editedElements = canvasDoc.elements.map((el: any) => {
      if (el.id === groomElementId) {
        return {
          ...el,
          content: "Chú rể Hoàng Gia",
          userEdited: true,
        };
      }
      return el;
    });

    const dataWithEditedElement = {
      ...sceneData,
      canvasDocument: {
        ...canvasDoc,
        elements: editedElements,
      },
    };

    // 3. Giả lập GET thiệp: ensureWeddingSceneData chạy lại trên data đã sửa
    const reloadedData = ensureWeddingSceneData(templateSlug, dataWithEditedElement);
    const reloadedDoc = reloadedData.canvasDocument as any;
    const preservedElement = reloadedDoc.elements.find(
      (el: any) => el.id === groomElementId
    );

    // KẾT QUẢ: Element phải giữ nguyên "Chú rể Hoàng Gia", không bị đè về "Nguyễn Văn A"
    expect(preservedElement.content).toBe("Chú rể Hoàng Gia");
    expect(preservedElement.userEdited).toBe(true);
  });

  it("đổi data.groom.fullName khi element chưa userEdited → vẫn sync theo giá trị mới", () => {
    // 1. Khởi tạo thiệp với groom.fullName = "Nguyễn Văn A"
    const initialData = {
      cardCategory: "WEDDING" as const,
      groom: { fullName: "Nguyễn Văn A", shortName: "Văn A" },
      bride: { fullName: "Trần Thị B", shortName: "Thị B" },
    };

    const sceneData = ensureWeddingSceneData(templateSlug, initialData);
    const canvasDoc = sceneData.canvasDocument as any;
    const bindings = canvasDoc.bindings as Record<string, string>;
    const groomElementId = Object.keys(bindings).find(
      (id) => bindings[id] === "groom.fullName"
    )!;

    // 2. Đổi data.groom.fullName thành "Nguyễn Văn B", element chưa có userEdited
    const updatedData = {
      ...sceneData,
      groom: { fullName: "Nguyễn Văn B", shortName: "Văn B" },
    };

    // 3. GET/PUT chạy lại ensureWeddingSceneData
    const syncedData = ensureWeddingSceneData(templateSlug, updatedData);
    const syncedDoc = syncedData.canvasDocument as any;
    const syncedElement = syncedDoc.elements.find(
      (el: any) => el.id === groomElementId
    );

    // KẾT QUẢ: Element tự động sync sang "Nguyễn Văn B"
    expect(syncedElement.content).toBe("Nguyễn Văn B");
  });

  it("khi PUT gửi element có content khác giá trị binding hiện tại → tự động gắn userEdited và giữ nguyên content", () => {
    // 1. Dữ liệu trong DB đang có groom.fullName = "Nguyễn Văn A"
    const existingCategoryData = ensureWeddingSceneData(templateSlug, {
      cardCategory: "WEDDING" as const,
      groom: { fullName: "Nguyễn Văn A", shortName: "Văn A" },
      bride: { fullName: "Trần Thị B", shortName: "Thị B" },
    });

    const canvasDoc = (existingCategoryData.canvasDocument as any);
    const bindings = canvasDoc.bindings as Record<string, string>;
    const groomElementId = Object.keys(bindings).find(
      (id) => bindings[id] === "groom.fullName"
    )!;

    // 2. Client gửi PUT request: element có content = "Chú rể Đẹp Trai" khác binding hiện tại "Nguyễn Văn A"
    const inputPayload: DraftCardInput = {
      slug: "thiep-cuoi-test",
      templateSlug,
      openingEffect: "NONE",
      fallingEffect: "NONE",
      primaryColor: "#000000",
      fontFamily: "Inter",
      data: {
        ...existingCategoryData,
        cardCategory: "WEDDING" as const,
        canvasDocument: {
          ...canvasDoc,
          elements: canvasDoc.elements.map((el: any) =>
            el.id === groomElementId
              ? { ...el, content: "Chú rể Đẹp Trai" } // Khác "Nguyễn Văn A"
              : el
          ),
        },
      } as any,
      events: [],
      photos: [],
    };

    // Gọi ensureWeddingScene với existingCategoryData
    const processed = ensureWeddingScene(inputPayload, existingCategoryData);
    const resultDoc = (processed as any).canvasDocument;
    const targetElement = resultDoc.elements.find(
      (el: any) => el.id === groomElementId
    );

    expect(targetElement.userEdited).toBe(true);
    expect(targetElement.content).toBe("Chú rể Đẹp Trai");
  });

  it("B8: sửa widgetConfig của widget calendar → GET lại phải giữ nguyên", () => {
    const initialData = {
      cardCategory: "WEDDING" as const,
      events: [{ eventName: "Tiệc cưới", eventDate: "2026-12-25T10:00:00Z" }],
    };

    const sceneData = ensureWeddingSceneData(templateSlug, initialData);
    const canvasDoc = sceneData.canvasDocument as any;

    // Tìm widget calendar
    let calendarElement = canvasDoc.elements.find(
      (el: any) => el.type === "widget" && el.widgetConfig?.widgetType === "calendar"
    );
    if (!calendarElement) {
      calendarElement = canvasDoc.elements.find(
        (el: any) => el.type === "widget" || el.id?.includes("calendar")
      );
    }
    if (!calendarElement) {
      calendarElement = {
        id: "section-calendar-widget",
        type: "widget",
        widgetConfig: { widgetType: "calendar", date: "2026-12-25" },
        userEdited: false,
      };
      canvasDoc.elements.push(calendarElement);
    }

    // Sửa widgetConfig và set userEdited: true (như PATCH thực hiện)
    const customConfig = { widgetType: "calendar", date: "2026-12-30", showLunar: true, theme: "gold" };
    const editedElements = canvasDoc.elements.map((el: any) => {
      if (el.id === calendarElement.id) {
        return {
          ...el,
          widgetConfig: customConfig,
          userEdited: true,
        };
      }
      return el;
    });

    const dataWithEditedWidget = {
      ...sceneData,
      canvasDocument: {
        ...canvasDoc,
        elements: editedElements,
      },
    };

    // GET lại: ensureWeddingSceneData chạy lại
    const reloadedData = ensureWeddingSceneData(templateSlug, dataWithEditedWidget);
    const reloadedDoc = reloadedData.canvasDocument as any;
    const preservedWidget = reloadedDoc.elements.find(
      (el: any) => el.id === calendarElement.id
    );

    expect(preservedWidget.widgetConfig).toEqual(customConfig);
    expect(preservedWidget.userEdited).toBe(true);
  });
});
