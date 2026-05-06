import { Link } from "react-router-dom";

export type MyOfferItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  companyName: string;
  entrepreneurName: string;
  offerAmountSar: number | null;
  equityPercentage: number | null;
  status: string;
  createdAt: string;
  respondedAt: string | null;
};

type MyOffersTableProps = {
  items: MyOfferItem[];
};

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  if (status === "pending") {
    return "قيد الانتظار";
  }

  if (status === "accepted") {
    return "مقبول";
  }

  if (status === "rejected") {
    return "مرفوض";
  }

  if (status === "negotiating") {
    return "تفاوض";
  }

  if (status === "withdrawn") {
    return "مسحوب";
  }

  return status;
}

function getStatusClass(status: string) {
  if (status === "accepted") {
    return "status-pill status-pill--success";
  }

  if (status === "rejected") {
    return "status-pill status-pill--danger";
  }

  if (status === "negotiating") {
    return "status-pill status-pill--warning";
  }

  if (status === "pending") {
    return "status-pill status-pill--info";
  }

  return "status-pill";
}

export default function MyOffersTable({ items }: MyOffersTableProps) {
  return (
    <div className="offers-table-wrap">
      <table className="offers-table">
        <thead>
          <tr>
            <th>المشروع</th>
            <th>رائد الأعمال</th>
            <th>قيمة العرض</th>
            <th>نسبة الملكية</th>
            <th>الحالة</th>
            <th>تاريخ الإرسال</th>
            <th>تاريخ الرد</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="offers-table__project">
                  <strong>{item.projectTitle}</strong>
                  <span>{item.companyName}</span>
                </div>
              </td>
              <td>{item.entrepreneurName}</td>
              <td>{formatMoney(item.offerAmountSar)}</td>
              <td>{item.equityPercentage !== null ? `${item.equityPercentage}%` : "—"}</td>
              <td>
                <span className={getStatusClass(item.status)}>{getStatusLabel(item.status)}</span>
              </td>
              <td>{formatDate(item.createdAt)}</td>
              <td>{formatDate(item.respondedAt)}</td>
              <td>
                <div className="offers-table__actions">
                  <Link to={`/investor/offers/${item.id}`} className="btn btn--primary btn--sm">
                    التفاصيل
                  </Link>
                  <Link
                    to={`/investor/explore/${item.projectId}`}
                    className="btn btn--secondary btn--sm"
                  >
                    المشروع
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}