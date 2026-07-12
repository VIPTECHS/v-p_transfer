export default function AdminPageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header__text">
        <h1>{title}</h1>
        {subtitle && <p className="admin-page-header__subtitle">{subtitle}</p>}
      </div>
      {(actions || children) && (
        <div className="admin-page-header__actions">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
