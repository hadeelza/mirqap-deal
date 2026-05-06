import type { ChangeEvent } from "react";

export type ExistingProjectFile = {
  id: string;
  fileName: string;
  fileType: string;
  bucketName: string | null;
  storagePath: string | null;
  publicUrl: string | null;
};

type EditProjectFilesSectionProps = {
  existingFiles: ExistingProjectFile[];
  filesMarkedForDelete: string[];
  newFiles: File[];
  onToggleRemoveExisting: (fileId: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemoveNewFile: (index: number) => void;
};

function formatFileType(value: string) {
  switch (value) {
    case "pitch_deck":
      return "عرض تقديمي";
    case "business_plan":
      return "خطة عمل";
    case "financials":
      return "ملفات مالية";
    case "prototype":
      return "Prototype";
    case "legal":
      return "ملف قانوني";
    case "other":
      return "أخرى";
    default:
      return value;
  }
}

export default function EditProjectFilesSection({
  existingFiles,
  filesMarkedForDelete,
  newFiles,
  onToggleRemoveExisting,
  onAddFiles,
  onRemoveNewFile,
}: EditProjectFilesSectionProps) {
  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>الملفات</h2>
      </div>

      <div className="entrepreneur-files-editor">
        <div className="entrepreneur-files-editor__block">
          <h3>الملفات الحالية</h3>

          {!existingFiles.length ? (
            <div className="entrepreneur-empty-mini">لا توجد ملفات مرفوعة حالياً.</div>
          ) : (
            <div className="entrepreneur-files-editor__list">
              {existingFiles.map((file) => {
                const marked = filesMarkedForDelete.includes(file.id);

                return (
                  <div key={file.id} className="entrepreneur-files-editor__item">
                    <div>
                      <strong>{file.fileName}</strong>
                      <p>{formatFileType(file.fileType)}</p>
                    </div>

                    <div className="entrepreneur-files-editor__actions">
                      {file.publicUrl ? (
                        <a
                          href={file.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn--ghost btn--sm"
                        >
                          فتح
                        </a>
                      ) : null}

                      <button
                        type="button"
                        className={marked ? "btn btn--primary btn--sm" : "btn btn--ghost btn--sm"}
                        onClick={() => onToggleRemoveExisting(file.id)}
                      >
                        {marked ? "تراجع عن الحذف" : "حذف"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="entrepreneur-files-editor__block">
          <h3>إضافة ملفات جديدة</h3>

          <label className="entrepreneur-upload-box" htmlFor="edit-project-files">
            <span>اختر ملفات جديدة لإضافتها إلى المشروع</span>
            <small>يمكن اختيار أكثر من ملف دفعة واحدة</small>
          </label>

          <input
            id="edit-project-files"
            type="file"
            multiple
            hidden
            onChange={(event: ChangeEvent<HTMLInputElement>) => onAddFiles(event.target.files)}
          />

          {!newFiles.length ? (
            <div className="entrepreneur-empty-mini">لم يتم اختيار ملفات جديدة بعد.</div>
          ) : (
            <div className="entrepreneur-files-editor__list">
              {newFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="entrepreneur-files-editor__item">
                  <div>
                    <strong>{file.name}</strong>
                    <p>{file.type || "نوع غير محدد"}</p>
                  </div>

                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onRemoveNewFile(index)}
                  >
                    إزالة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}