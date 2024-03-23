
import React from 'react';

class MapHelper {

    constructor(map, OpenLocalityDetail) {
        this.map = map;
        this.OpenLocalityDetail = OpenLocalityDetail;
    }

    FlattenAffected = (list) => {
        // The list arrays have 1 less depth
        Object.keys(list).forEach(key => {
            list[key] = list[key].flat();
        })

        return list;
    }

    FilterLessSevereLocalities = (affected) => {

        let filterByColors = [
            "red",
            "orange",
            "yellow",
            "green"
        ];

        // remove less severe duplicate localities
        filterByColors.forEach(color => {
            affected = this.RemoveLessSevereLocality(affected, color);
        })

        return affected;
    }

    RemoveLessSevereLocality = (cisorpList, localitySeverityKey) => {

        let currentSeverityList = cisorpList[localitySeverityKey];
        if (currentSeverityList == undefined)
            return cisorpList;

        let reduced = {};

        Object.keys(cisorpList).forEach(key => {

            if (key != localitySeverityKey) {

                cisorpList[key].forEach(locality => {

                    let addLocality = true;
                    currentSeverityList.forEach(u => {
                        if (u.cisorp == locality.cisorp) {
                            addLocality = false;
                            return;
                        }
                    })

                    if (addLocality) {
                        if (!reduced.hasOwnProperty(key))
                            reduced[key] = [];
                        reduced[key].push(locality);
                    }

                })
            }
        })

        reduced[localitySeverityKey] = currentSeverityList;

        return reduced;
    }

    GetLocalityLabel(localityList, targetId) {

        if (targetId == null)
            return;

        let targetLocality = null;
        Object.entries(localityList).forEach(([region, localities]) => {

            const locality = localities.find((item) => item.cisorp == targetId);
            if (locality) {
                targetLocality = {name: locality.name, region: region};
                return;
            }
        });

        if (targetLocality == null)
            return;

        return (
            <div className='label d-flex flex-column align-items-end'>
                <span className='fw-bold'>{targetLocality.name}</span>
                <span className='border-top'>{targetLocality.region}</span>
            </div>
        );
    }

    GetColoredMap(affected, HandleLocalityHover, HandleLocalityHoverEnd) {

        const mapClone = this.map.map(element => element.cloneNode(true));

        mapClone.forEach(g => {
            Object.entries(affected).forEach(([color, localities]) => {

                const locality = localities.find((item) => item.cisorp == g.getAttribute('cisorp'));
                if (locality) {
                    g.setAttribute("class", color)
                }
            })
        })

        return (  
            <svg viewBox="19 78 1440 830" className='col-12 col-lg-10 col-xl-8'>
                <g stroke="black" fill="white">
                    {
                        mapClone.map((g, index) => (
                            <g
                                id={g.id} key={index}
                                className={g.getAttribute('class')}
                                onClick={() => this.OpenLocalityDetail(g.getAttribute('cisorp'))}
                                onMouseOver={() => HandleLocalityHover(g.getAttribute('cisorp'))}
                                onMouseLeave={() => HandleLocalityHoverEnd()}
                            >
                                <path d={g.children[0].getAttribute('d')}></path>
                            </g>
                        ))
                    }
                </g>
            </svg>
        );
    }
}

export default MapHelper;