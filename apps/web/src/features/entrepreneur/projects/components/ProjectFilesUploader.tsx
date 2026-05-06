import type { ChangeEvent } from "react";

export type ProjectFileType =
  | "pitch_deck"
  | "business_plan"
  | "financials"
  | "prototype"
  | "legal"
  | "other";

export type PendingProjectFile = {
  localId: string;
  file: File;
  fileType: ProjectFileType;
};

type ProjectFilesUploaderProps = {
  files: PendingProjectFile[];
  onAddFiles: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (localId: string) => void;
  onChangeFileType: (localId: string, fileType: ProjectFileType) => void;
};

const fileTypeOptions: Array<{ value: ProjectFileType; label: string }> = [
  { value: "pitch_deck", label: "عرض تقديمي" },
  { value: "business_plan", label: "خطة عمل" },
  { value: "financials", label: "بيانات مالية" },
  { value: "prototype", label: "نموذج أولي" },
  { value: "legal", label: "ملف قانوني" },
  { value: "other", label: "أخرى" },
];

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProjectFilesUploader({
  files,
  onAddFiles,
  onRemoveFile,
  onChangeFileType,
}: ProjectFilesUploaderProps) {
  return (
    <section className="project-create-section">
      <div className="project-create-section__header">
        <h3>ملفات المشروع</h3>
        <p>أضف الملفات الداعمة للمشروع، ويمكن تحديد نوع كل ملف قبل الحفظ.</p>
      </div>

      <label className="project-file-upload-box">
        <input type="file" multiple onChange={onAddFiles} />
        <span>اختر الملفات</span>
        <small>يمكنك رفع أكثر من ملف مرة واحدة</small>
      </label>

      {files.length > 0 ? (
        <div className="project-files-list">
          {files.map((item) => (
            <div key={item.localId} className="project-file-item">
              <div className="project-file-item__info">
                <strong>{item.file.name}</strong>
                <span>{formatFileSize(item.file.size)}</span>
              </div>

              <div className="project-file-item__actions">
                <select
                  value={item.fileType}
                  onChange={(event) =>
                    onChangeFileType(item.localId, event.target.value as ProjectFileType)
                  }
                >
                  {fileTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="project-file-item__remove"
                  onClick={() => onRemoveFile(item.localId)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="project-create-empty">لا توجد ملفات مضافة حالياً.</div>
      )}
    </section>
  );
}