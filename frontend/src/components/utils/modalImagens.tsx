import React, { useEffect, useState } from 'react';
import { deleteImageNota, getImagensNota, salvarImagensNota } from '../../services/APIService';

interface notaImagens {
    id: number,
    caminho_imagem: string,
    nota_id: number
} 

export default function ModalUploadImagens({ notaId }: { notaId: number | undefined }) {
    const [showModal, setShowModal] = useState(false);
    const [imagensPreview, setImagensPreview] = useState<string[]>([]);
    const [imagensArquivos, setImagensArquivos] = useState<File[]>([]);
    //   const [carregando, setCarregando] = useState(false);
    const [hasImage, setHasImage] = useState(false)
    const [openUploadImage, setOpenUploadImage] = useState(false)
    const [imagensPreviewSalvas, setImagensPreviewSalvas] = useState<notaImagens[]>([])

    const checkImages = async () => {
        try {
          getImagensNota(notaId === undefined ? 0 : notaId).then(data => {
            if(data.length > 0){
                setHasImage(true)
                setImagensPreviewSalvas(data);
                setOpenUploadImage(false)
            }else{
                setHasImage(false)
                setImagensPreviewSalvas([]);
                setOpenUploadImage(true)
            }
          })
        } catch (error) {
          console.error('Erro ao verificar imagens:', error);
          setHasImage(false);
          setImagensPreviewSalvas([]);
          setOpenUploadImage(true)
        }
      };
    
      // Chama a verificação sempre que o modal for aberto
      useEffect(() => {
        if (showModal) {
          checkImages();
        }
      }, [showModal]);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const arrayFiles = Array.from(files);

        setImagensArquivos(arrayFiles);
        const previews = arrayFiles.map(file => URL.createObjectURL(file));
        setImagensPreview(previews);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const removerImagem = (id: number) =>{
        deleteImageNota(id).then(() => {
            checkImages();
        })
    }

    const handleUpload = async () => {
        if (imagensArquivos.length === 0) return alert('Selecione ao menos uma imagem!');

        try {
        //   setCarregando(true);
        const formData = new FormData();
        imagensArquivos.forEach(file => formData.append('imagens', file));

        salvarImagensNota(notaId === undefined ? 0 : notaId, formData).then(res => {
            res.data;
            setShowModal(false);
            setImagensArquivos([]);
            setImagensPreview([]);
        })
        } catch (error) {
        console.error('Erro ao enviar imagens:', error);
        alert('Erro ao enviar imagens!');
        } finally {
        //   setCarregando(false);
        }
    };

    return (
        <div>
        {/* Botão para abrir o modal */}
        <button
            onClick={() => setShowModal(true)}
            className="botao-icone"
        >
            📷
        </button>

        {/* Modal */}
        {showModal && (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                position: 'relative',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}>
                {/* Botão fechar */}
                <button onClick={() => setShowModal(false)} style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    fontSize: '15px',
                    cursor: 'pointer'
                }}>❌</button>

                {/* se tiver imagens */}
                {hasImage && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                    }}>
                        {imagensPreviewSalvas.map((data) => (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img 
                                key={data.id} 
                                src={`http://localhost:3000/${data.caminho_imagem}`} 
                                alt={`Preview ${data.id}`} 
                                onClick={() => window.open(`http://localhost:3000/${data.caminho_imagem}`, '_blank')}
                                style={{
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: `solid 2px black`,
                                    cursor: `zoom-in`
                                }} />
                                <button onClick={() => removerImagem(data.id)} style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    bottom: `5px`,
                                    left: `-5px`
                                }}>
                                    🗑️
                                </button>
                            </ div>
                        ))}
                    </div>
                )}

                {!openUploadImage && (
                    <div>
                        <button style={{backgroundColor: '#4A90E2',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '16px'}} onClick={() => setOpenUploadImage(!openUploadImage)}>+ Adicionar novas Imagens</button>
                    </div>
                )}

                {/* Área drag and drop */}
                {openUploadImage && (
                    <>
                        <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('fileInput')?.click()}
                        style={{
                        border: '2px dashed #ccc',
                        padding: '60px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '35px',
                        marginTop: `35px`
                        }}
                    >
                        {imagensPreview.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px'
                        }}>
                            {imagensPreview.map((src, idx) => (
                            <img key={idx} src={src} alt={`Preview ${idx}`} style={{
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }} />
                            ))}
                        </div>
                        ) : (
                        <>
                            <p style={{ fontSize: '40px' }}>🖼️</p>
                            <p style={{ color: '#777' }}>Arraste imagens aqui ou clique para selecionar</p>
                        </>
                        )}
                    </div>
        
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFiles(e.target.files)}
                    />
        
                    <button onClick={handleUpload} style={{
                        backgroundColor: '#4A90E2',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '16px'
                    }}>
                        Fazer Upload
                    </button>
                    </>
                )}
                </div>
            </div>
        )}
        </div>
    );
}