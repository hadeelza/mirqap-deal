type LoaderProps = {
    label?: string;
    fullScreen?: boolean;
  };
  
  export function Loader({ label = "جاري التحميل...", fullScreen = false }: LoaderProps) {
    return (
      <div className={fullScreen ? "loader-screen" : "loader-inline"}>
        <div className="loader-spinner" />
        <span>{label}</span>
      </div>
    );
  }
  
  export default Loader;