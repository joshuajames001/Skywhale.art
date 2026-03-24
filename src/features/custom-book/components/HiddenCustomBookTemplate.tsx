import React from 'react';
import { BookPage } from '../types';

interface HiddenCustomBookTemplateProps {
    pages: BookPage[];
    isExporting: boolean;
}

export const HiddenCustomBookTemplate: React.FC<HiddenCustomBookTemplateProps> = ({ pages, isExporting }) => {
    if (!isExporting) return null;

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px' }}>
            {pages.map((page, index) => (
                <div
                    key={page.id}
                    id={`book-page-${index}`}
                    style={{
                        width: '794px',
                        height: '1123px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Image */}
                    {page.imageUrl && (
                        <div style={{
                            flex: page.isCover ? '1' : '0 0 60%',
                            width: '100%',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f0',
                        }}>
                            <img
                                src={page.imageUrl}
                                alt=""
                                crossOrigin="anonymous"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    )}

                    {/* Text */}
                    {page.text && (
                        <div style={{
                            flex: 1,
                            padding: page.isCover ? '40px 60px' : '30px 50px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: page.isCover ? 'center' : 'flex-start',
                            alignItems: page.isCover ? 'center' : 'flex-start',
                        }}>
                            <p style={{
                                fontFamily: 'Quicksand, sans-serif',
                                fontSize: page.isCover ? '32px' : '18px',
                                fontWeight: page.isCover ? '700' : '400',
                                lineHeight: '1.8',
                                color: '#1a1a1a',
                                textAlign: page.isCover ? 'center' : 'left',
                                whiteSpace: 'pre-wrap',
                            }}>
                                {page.text}
                            </p>
                        </div>
                    )}

                    {/* Empty page fallback */}
                    {!page.imageUrl && !page.text && (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ccc',
                            fontSize: '14px',
                        }}>
                            Prázdná stránka
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
