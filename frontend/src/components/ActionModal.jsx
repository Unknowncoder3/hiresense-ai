export default function ActionModal({title,subtitle,children,onClose,footer}){
 return <div className="modal-backdrop-custom" onClick={onClose}>
   <div className="action-modal" onClick={e=>e.stopPropagation()}>
     <div className="action-modal-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-btn" onClick={onClose}><i className="bi bi-x-lg"/></button></div>
     <div className="action-modal-body">{children}</div>
     {footer&&<div className="action-modal-foot">{footer}</div>}
   </div>
 </div>
}
