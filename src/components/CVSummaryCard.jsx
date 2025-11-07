export default function CVSummaryCard({ title, data }) {
  const renderBasicInfo = (info) => {
    if (!info || typeof info !== 'object') return <div className="text-gray-500 italic">No Result</div>;
    return (
      <div className="space-y-2">
        {info.Name && <div><span className="font-medium text-gray-900">Name:</span> <span className="text-gray-700">{info.Name}</span></div>}
        {info.Phone && <div><span className="font-medium text-gray-900">Phone:</span> <span className="text-gray-700">{info.Phone}</span></div>}
        {info.Email && <div><span className="font-medium text-gray-900">Email:</span> <span className="text-gray-700">{info.Email}</span></div>}
        {info.Address && <div><span className="font-medium text-gray-900">Address:</span> <span className="text-gray-700">{info.Address}</span></div>}
        {!info.Name && !info.Phone && !info.Email && !info.Address && <div className="text-gray-500 italic">No Result</div>}
      </div>
    );
  };

  const renderEducation = (edu) => {
    if (!edu || !Array.isArray(edu) || edu.length === 0) return <div className="text-gray-500 italic">No Result</div>;
    return (
      <div className="space-y-4">
        {edu.map((item, idx) => (
          <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
            {item.School && <div className="font-semibold text-gray-900">{item.School}</div>}
            {item.Certificate && <div className="text-gray-700 mt-1">{item.Certificate}</div>}
            {item.Year && <div className="text-sm text-gray-500 mt-1">{item.Year}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = (exp) => {
    if (!exp || !Array.isArray(exp) || exp.length === 0) return <div className="text-gray-500 italic">No Result</div>;
    return (
      <div className="space-y-4">
        {exp.map((item, idx) => (
          <div key={idx} className="border-l-2 border-green-500 pl-4 py-2">
            {item.Company && <div className="font-semibold text-gray-900">{item.Company}</div>}
            {item.Period && <div className="text-sm text-gray-600 mt-1">{item.Period}</div>}
            {item.Role && Array.isArray(item.Role) && item.Role.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.Role.map((role, rIdx) => (
                  <span key={rIdx} className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkill = (skill) => {
    if (!skill || typeof skill !== 'object') return <div className="text-gray-500 italic">No Result</div>;
    return (
      <div className="space-y-4">
        {skill['technical skills'] && Array.isArray(skill['technical skills']) && skill['technical skills'].length > 0 && (
          <div>
            <div className="font-medium text-gray-900 mb-2">Technical Skills</div>
            <div className="flex flex-wrap gap-2">
              {skill['technical skills'].map((s, idx) => (
                <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {skill['soft skills'] && Array.isArray(skill['soft skills']) && skill['soft skills'].length > 0 && (
          <div>
            <div className="font-medium text-gray-900 mb-2">Soft Skills</div>
            <div className="flex flex-wrap gap-2">
              {skill['soft skills'].map((s, idx) => (
                <span key={idx} className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {(!skill['technical skills'] || skill['technical skills'].length === 0) && 
         (!skill['soft skills'] || skill['soft skills'].length === 0) && 
         <div className="text-gray-500 italic">No Result</div>}
      </div>
    );
  };

  const renderContent = () => {
    if (!data) return <div className="text-gray-500 italic">No Result</div>;
    
    if (title === 'Basic information') {
      return renderBasicInfo(data);
    }
    
    if (title === 'Education') {
      return renderEducation(data);
    }
    
    if (title === 'Experience') {
      return renderExperience(data);
    }
    
    if (title === 'Skill') {
      return renderSkill(data);
    }
    
    // For Summary and Career path (strings)
    if (typeof data === 'string') {
      return <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data || 'No Result'}</div>;
    }
    
    // Fallback for arrays
    if (Array.isArray(data)) {
      if (data.length === 0) return <div className="text-gray-500 italic">No Result</div>;
      return (
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="text-gray-700">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for objects
    if (typeof data === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-gray-900">{key}:</span>{' '}
              <span className="text-gray-700">
                {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return <div className="text-gray-500 italic">No Result</div>;
  };

  return (
    <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-5 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b border-gray-200 pb-2">{title}</h3>
      <div className="text-sm">
        {renderContent()}
      </div>
    </div>
  );
}


