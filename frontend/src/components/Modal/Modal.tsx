import React from "react";

type ModalType = {
    canShow: boolean;
    updateModalState: Function
    data: any;
}

const Modal = (canShow: ModalType) => {
    return (
        <div className={`p-8 bg-white border border-blue-100 shadow-lg rounded-2xl z-50 modal-swipe modal-container ${canShow?.canShow ? 'show' : 'hidden'}`} role="alert">
            <div className="items-center sm:flex">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-blue-400 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                        clipRule="evenodd"
                        d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                        fillRule="evenodd"
                    />
                  </svg>
                </span>

                <p className="mt-3 text-lg font-medium sm:mt-0 sm:ml-3">You've got a new message</p>
            </div>

            <p className="mt-4 text-gray-500">
                {canShow.data}
            </p>

            <div className="mt-6 sm:flex">
                <button
                    className="inline-block w-full px-5 py-3 text-sm font-semibold text-center text-white bg-blue-500 rounded-lg sm:w-auto"
                >
                    Pas mal !
                </button>
            </div>
        </div>
    );
};

export default Modal;