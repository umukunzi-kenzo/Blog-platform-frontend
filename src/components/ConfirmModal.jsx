const ConfirmModal = ({
  icon: Icon,
  title,
  subtitle,
  children,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  themeClass,
}) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div
        className={`${themeClass(
          "bg-[#1a1a1a] border-[#333]",
          "bg-white border-gray-200"
        )} rounded-xl border w-full max-w-sm overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${themeClass("border-[#333]", "border-gray-200")}`}>
          <h2
            className={`text-lg font-bold ${themeClass(
              "text-white",
              "text-gray-900"
            )} mb-1 flex items-center`}
          >
            {Icon && (
              <Icon className={`mr-2 w-5 h-5 ${themeClass("text-red-400", "text-red-600")}`} />
            )}
            {title}
          </h2>
          {subtitle && <p className={themeClass("text-[#999]", "text-gray-600")}>{subtitle}</p>}
        </div>

        {/* Body and buttons */}
        <div className="p-5">
          {children && <div className="mb-5">{children}</div>}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className={`px-4 py-2 ${themeClass(
                "bg-[#222] text-white hover:bg-[#333]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300"
              )} rounded-lg transition font-medium text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;