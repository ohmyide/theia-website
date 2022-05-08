import React from 'react'
import { useTranslation } from 'gatsby-plugin-react-i18next';

import styled from '@emotion/styled'
import { products } from '../../utils/data'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import 'swiper/components/navigation/navigation.min.css'
import SwiperCore, {
  Autoplay, Navigation
} from 'swiper/core';

SwiperCore.use([Autoplay, Navigation]);

const Styled = styled.div`
    .products {
        padding-bottom: 5rem;
        margin-top: 4rem;
        position: relative;
        &__thumb {
            height: 100%;
            max-width: 100%;
            object-fit: fill;
            cursor: pointer;
            display: block;
            margin: auto;

            &-container {
                height: 18rem;
                padding: 2px;
                @media(min-width: 768px) {
                    text-align: center;
                }
                @media(max-width: 50rem) {
                    width: 40%;
                    margin-bottom: 4rem;
                }
                @media(max-width: 30rem) {
                    width: 100%;
                }
            }
            &-popup {
                height: 100%;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        }
    }
    .swiper-button-next, .swiper-button-prev {
        color: black;
        margin-top: calc(0px - (var(--swiper-navigation-size)/ 2));
    }
    @media(min-width: 1120px) {
        .swiper-button-next {
            right: -6rem;
        }
        .swiper-button-prev {
            left: -6rem;
        }
    }
`

const Products = () => {
    const {t} = useTranslation();
    return (
        <div className="row">
            <Styled>
                <section className="products" >
                    <h3 className="heading-tertiary">{t("Selected Tools based on Eclipse Theia")}</h3>
                    <div className="swiper-button-prev"></div>
                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={1}
                        breakpoints={{
                            "750": {
                                "slidesPerView": 2,
                            },
                            "1120": {
                                "slidesPerView": 3,
                                "spaceBetween": 20,
                            }
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev'
                        }}
                        autoplay={{
                            "delay": 4000,
                            "disableOnInteraction": false
                        }}
                    >
                        {
                        products.map((item, i) => (
                            <SwiperSlide key={i} className="products__thumb-container">
                                <Popup key={i}
                                    trigger={
                                    <div className="products__thumb-popup">
                                        <img className="products__thumb" src={item.thumb} alt={item.alt} />
                                    </div>
                                    
                                    } modal>
                                    {close => (
                                    <>
                                        <button className="close" onClick={close}>
                                            &times;
                                        </button>
                                        <h2>{item.alt}</h2>
                                        <img style={{ width: '100%', margin: '2rem' }} src={item.src} alt={item.alt} />
                                        <a className="btn" href={item.href} target="_blank" rel="noopener noreferrer">More information</a>
                                    </>
                                    )}
                                </Popup>
                            </SwiperSlide>
                        ))
                    }
                    </Swiper>
                    <div className="swiper-button-next"></div>
                </section>
            </Styled>
        </div>
    )
}

export default Products
