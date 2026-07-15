from github import Github, GithubException
import os
import re
import json

class GitHubService:
    def __init__(self):
        self.token = os.getenv('GITHUB_TOKEN')
        if self.token:
            self.github = Github(self.token)
        else:
            self.github = Github()
    
    def get_repository(self, repo_url):
        repo_name = repo_url.replace('https://github.com/', '').replace('.git', '')
        return self.github.get_repo(repo_name)
    
    def get_dependencies(self, repo):
        """Extract dependencies from package.json with their licenses (cached lookup)"""
        deps = []
        known_licenses = {
            'react': ('MIT', 'LOW'), 'react-dom': ('MIT', 'LOW'), 'lodash': ('MIT', 'LOW'),
            'axios': ('MIT', 'LOW'), 'express': ('MIT', 'LOW'), 'next': ('MIT', 'LOW'),
            'vue': ('MIT', 'LOW'), 'angular': ('MIT', 'LOW'), 'typescript': ('Apache-2.0', 'LOW'),
            'webpack': ('MIT', 'LOW'), 'babel': ('MIT', 'LOW'), 'eslint': ('MIT', 'LOW'),
            'jest': ('MIT', 'LOW'), 'mocha': ('MIT', 'LOW'), 'chai': ('MIT', 'LOW'),
            'moment': ('MIT', 'LOW'), 'chart.js': ('MIT', 'LOW'), 'd3': ('ISC', 'LOW'),
            'three': ('MIT', 'LOW'), 'socket.io': ('MIT', 'LOW'), 'gulp': ('MIT', 'LOW'),
            'grunt': ('MIT', 'LOW'), 'redux': ('MIT', 'LOW'), 'react-router': ('MIT', 'LOW'),
            'framer-motion': ('MIT', 'LOW'), 'tailwindcss': ('MIT', 'LOW'),
            'postcss': ('MIT', 'LOW'), 'autoprefixer': ('MIT', 'LOW'),
            'uuid': ('MIT', 'LOW'), 'dotenv': ('BSD-2-Clause', 'LOW'),
            'body-parser': ('MIT', 'LOW'), 'cors': ('MIT', 'LOW'),
            'jsonwebtoken': ('MIT', 'LOW'), 'mongoose': ('MIT', 'LOW'),
            'redis': ('MIT', 'LOW'), 'passport': ('MIT', 'LOW'),
            'bcrypt': ('MIT', 'LOW'), 'multer': ('MIT', 'LOW'),
            'joi': ('BSD-3-Clause', 'LOW'), 'helmet': ('MIT', 'LOW'),
            'compression': ('MIT', 'LOW'), 'morgan': ('MIT', 'LOW'),
            'winston': ('MIT', 'LOW'), 'nodemailer': ('MIT', 'LOW'),
            'cheerio': ('MIT', 'LOW'), 'puppeteer': ('Apache-2.0', 'LOW'),
            'graphql': ('MIT', 'LOW'), 'apollo': ('MIT', 'LOW'),
            'date-fns': ('MIT', 'LOW'), 'immer': ('MIT', 'LOW'),
            'zustand': ('MIT', 'LOW'), 'react-hook-form': ('MIT', 'LOW'),
            'zod': ('MIT', 'LOW'), 'prisma': ('Apache-2.0', 'LOW'),
        }
        try:
            content = repo.get_contents('package.json')
            data = json.loads(content.decoded_content)
            all_deps = {}
            all_deps.update(data.get('dependencies', {}))
            all_deps.update(data.get('devDependencies', {}))
            for pkg_name in list(all_deps.keys())[:50]:
                base = pkg_name.split('/')[0] if pkg_name.startswith('@') else pkg_name
                if base in known_licenses:
                    lic, risk = known_licenses[base]
                    info = self._get_license_details(lic)
                    deps.append({
                        'name': pkg_name, 'version': all_deps[pkg_name],
                        'license': info.get('name', lic), 'license_key': info.get('key', lic.lower()),
                        'risk': risk,
                    })
                else:
                    deps.append({
                        'name': pkg_name, 'version': all_deps[pkg_name],
                        'license': 'Unknown', 'license_key': 'unknown', 'risk': 'UNKNOWN',
                    })
        except:
            pass
        return deps
    
    def check_policy(self, license_key):
        """Check license against company policy"""
        from scanner.models import LicensePolicy
        try:
            policy = LicensePolicy.objects.get(license_key=license_key.lower())
            return {'action': policy.action, 'policy_name': policy.license_name}
        except LicensePolicy.DoesNotExist:
            return {'action': 'warn', 'policy_name': None}
    
    def get_license_info(self, repo):
        """Professional license detection - sab pick karega"""
        
        # FIRST: Check COPYING files (Linux-style repos ke liye)
        copy_files = ['COPYING', 'COPYING.md', 'COPYING.txt']
        for filename in copy_files:
            try:
                content = repo.get_contents(filename).decoded_content.decode('utf-8')
                result = self._detect_any_license(content)
                if result.get('key') != 'unknown':
                    return result
            except:
                pass
        
        # SECOND: GitHub's license API
        if repo.license:
            spdx = repo.license.spdx_id or repo.license.key
            if spdx and spdx.lower() != 'other':
                return self._get_license_details(spdx)
        
        # THIRD: Check standard LICENSE files
        license_files = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE']
        for filename in license_files:
            try:
                content = repo.get_contents(filename).decoded_content.decode('utf-8')
                result = self._detect_any_license(content)
                if result.get('key') != 'unknown':
                    return result
            except:
                continue
        
        # FOURTH: Check README for SPDX identifier
        try:
            readme = repo.get_contents('README.md')
            readme_content = readme.decoded_content.decode('utf-8')
            
            # Look for SPDX-License-Identifier
            spdx_match = re.search(r'SPDX-License-Identifier:\s*([^\s\n]+)', readme_content, re.IGNORECASE)
            if spdx_match:
                return self._get_license_details(spdx_match.group(1))
            
            if 'proprietary' in readme_content.lower():
                return self._get_license_details('proprietary')
        except:
            pass
        
        # FIFTH: Check package files
        license_from_package = self._check_package_files(repo)
        if license_from_package:
            return license_from_package
        
        return self._get_license_details('no-license')
    
    def _check_package_files(self, repo):
        """Check package.json, setup.py, pyproject.toml, etc."""
        
        try:
            pkg = repo.get_contents('package.json')
            import json
            data = json.loads(pkg.decoded_content)
            if data.get('license'):
                return self._get_license_details(data['license'])
        except:
            pass
        
        try:
            setup = repo.get_contents('setup.py')
            content = setup.decoded_content.decode('utf-8')
            match = re.search(r"license=['\"]([^'\"]+)['\"]", content)
            if match:
                return self._get_license_details(match.group(1))
        except:
            pass
        
        try:
            toml = repo.get_contents('pyproject.toml')
            content = toml.decoded_content.decode('utf-8')
            match = re.search(r'license\s*=\s*["\']([^"\']+)["\']', content)
            if match:
                return self._get_license_details(match.group(1))
        except:
            pass
        
        return None
    
    def _detect_any_license(self, content):
        """20+ licenses detect karega + custom/proprietary bhi"""
        content_lower = content.lower()
        
        # GPL FAMILY - Highest priority
        if 'gpl' in content_lower or 'gnu general public license' in content_lower:
            if 'version 3' in content_lower or 'gpl-3.0' in content_lower:
                return self._get_license_details('GPL-3.0')
            elif 'version 2' in content_lower or 'gpl-2.0' in content_lower:
                return self._get_license_details('GPL-2.0')
            elif 'spdx-license-identifier: gpl-2.0' in content_lower:
                return self._get_license_details('GPL-2.0')
            else:
                return self._get_license_details('GPL')
        
        # PERMISSIVE LICENSES (LOW RISK)
        if 'mit license' in content_lower or 'permission is hereby granted' in content_lower:
            if 'mit' in content_lower:
                return self._get_license_details('MIT')
        
        if 'apache license' in content_lower and 'version 2.0' in content_lower:
            return self._get_license_details('Apache-2.0')
        
        if 'bsd' in content_lower and ('2-clause' in content_lower or '3-clause' in content_lower):
            if '3-clause' in content_lower:
                return self._get_license_details('BSD-3-Clause')
            return self._get_license_details('BSD-2-Clause')
        
        if 'isc license' in content_lower:
            return self._get_license_details('ISC')
        
        # OTHER COPLYLEFT
        if 'gnu lesser general public license' in content_lower or 'lgpl' in content_lower:
            return self._get_license_details('LGPL-3.0')
        
        if 'gnu affero general public license' in content_lower or 'agpl' in content_lower:
            return self._get_license_details('AGPL-3.0')
        
        # WEAK COPLYLEFT (MEDIUM RISK)
        if 'mozilla public license' in content_lower or 'mpl' in content_lower:
            return self._get_license_details('MPL-2.0')
        
        if 'eclipse public license' in content_lower or 'epl' in content_lower:
            return self._get_license_details('EPL-2.0')
        
        # PUBLIC DOMAIN
        if 'unlicense' in content_lower:
            return self._get_license_details('Unlicense')
        
        if 'cc0' in content_lower or 'creative commons zero' in content_lower:
            return self._get_license_details('CC0-1.0')
        
        # CUSTOM / PROPRIETARY DETECTION
        proprietary_keywords = [
            'proprietary', 'all rights reserved', 'commercial license',
            'private license', 'custom license', 'company confidential',
            'do not distribute', 'internal use only', 'proprietary software'
        ]
        
        for keyword in proprietary_keywords:
            if keyword in content_lower:
                return self._get_license_details('proprietary')
        
        if 'license' in content_lower or 'licensed' in content_lower:
            return self._get_license_details('custom')
        
        return self._get_license_details('unknown')
    
    def _get_license_details(self, key):
        """Complete license database - 30+ licenses"""
        licenses_db = {
            'MIT': {
                'name': 'MIT License',
                'key': 'mit',
                'category': 'Permissive',
                'risk': 'LOW',
                'description': 'Very permissive. Allows commercial use, modification, distribution. Only requires attribution.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': ['Attribution required', 'Include copyright notice'],
                'limitations': ['No liability', 'No warranty', 'No trademark use']
            },
            'Apache-2.0': {
                'name': 'Apache License 2.0',
                'key': 'apache-2.0',
                'category': 'Permissive',
                'risk': 'LOW',
                'description': 'Permissive with patent protection. Commercial use allowed. Requires attribution.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
                'conditions': ['Attribution required', 'Include license notice', 'State changes'],
                'limitations': ['No liability', 'No warranty', 'No trademark use']
            },
            'BSD-3-Clause': {
                'name': 'BSD 3-Clause License',
                'key': 'bsd-3-clause',
                'category': 'Permissive',
                'risk': 'LOW',
                'description': 'Very permissive. Commercial use allowed. Requires attribution. No endorsement.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': ['Attribution required', 'Include copyright notice'],
                'limitations': ['No liability', 'No warranty', 'No endorsement']
            },
            'BSD-2-Clause': {
                'name': 'BSD 2-Clause License',
                'key': 'bsd-2-clause',
                'category': 'Permissive',
                'risk': 'LOW',
                'description': 'Simplified BSD. Commercial use allowed. Just include copyright notice.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': ['Attribution required', 'Include copyright notice'],
                'limitations': ['No liability', 'No warranty']
            },
            'ISC': {
                'name': 'ISC License',
                'key': 'isc',
                'category': 'Permissive',
                'risk': 'LOW',
                'description': 'Similar to MIT. Very permissive. Commercial use allowed.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': ['Attribution required', 'Include copyright notice'],
                'limitations': ['No liability', 'No warranty']
            },
            'GPL-3.0': {
                'name': 'GNU General Public License v3.0',
                'key': 'gpl-3.0',
                'category': 'Copyleft',
                'risk': 'HIGH',
                'description': 'Strong copyleft. Any derivative work must also be GPL. Commercial use allowed but must share source.',
                'icon': '🔴',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': True,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Open source required', 'State changes', 'Include license'],
                'limitations': ['No liability', 'No warranty']
            },
            'GPL-2.0': {
                'name': 'GNU General Public License v2.0',
                'key': 'gpl-2.0',
                'category': 'Copyleft',
                'risk': 'HIGH',
                'description': 'Strong copyleft. Not compatible with GPLv3. Must share source code.',
                'icon': '🔴',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': True,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Open source required', 'Include license'],
                'limitations': ['No liability', 'No warranty']
            },
            'GPL': {
                'name': 'GNU General Public License',
                'key': 'gpl',
                'category': 'Copyleft',
                'risk': 'HIGH',
                'description': 'Strong copyleft license. Must share source code if distributed.',
                'icon': '🔴',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': True,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Open source required', 'Include license'],
                'limitations': ['No liability', 'No warranty']
            },
            'AGPL-3.0': {
                'name': 'GNU Affero General Public License v3.0',
                'key': 'agpl-3.0',
                'category': 'Network Copyleft',
                'risk': 'HIGH',
                'description': 'Even network use (SaaS/API) requires open source. Strongest copyleft.',
                'icon': '🔴',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': True,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Open source required', 'Network use = distribution'],
                'limitations': ['No liability', 'No warranty']
            },
            'LGPL-3.0': {
                'name': 'GNU Lesser General Public License v3.0',
                'key': 'lgpl-3.0',
                'category': 'Weak Copyleft',
                'risk': 'MEDIUM',
                'description': 'Weak copyleft. Can use in proprietary software as a library. Changes to library must be open source.',
                'icon': '🟡',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': ['Attribution required', 'Library changes open source', 'Include license'],
                'limitations': ['No liability', 'No warranty']
            },
            'MPL-2.0': {
                'name': 'Mozilla Public License 2.0',
                'key': 'mpl-2.0',
                'category': 'Weak Copyleft',
                'risk': 'MEDIUM',
                'description': 'File-level copyleft. Modified files must be open source. Good for mixed projects.',
                'icon': '🟡',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Modified files open source', 'Include license'],
                'limitations': ['No liability', 'No warranty', 'Trademark use']
            },
            'EPL-2.0': {
                'name': 'Eclipse Public License 2.0',
                'key': 'epl-2.0',
                'category': 'Weak Copyleft',
                'risk': 'MEDIUM',
                'description': 'Commercial friendly. Modified code must be shared if distributed.',
                'icon': '🟡',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': True,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution'],
                'conditions': ['Attribution required', 'Modified files open source', 'Include license'],
                'limitations': ['No liability', 'No warranty']
            },
            'Unlicense': {
                'name': 'The Unlicense',
                'key': 'unlicense',
                'category': 'Public Domain',
                'risk': 'LOW',
                'description': 'No restrictions whatsoever. Public domain dedication.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': False,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': [],
                'limitations': ['No liability', 'No warranty']
            },
            'CC0-1.0': {
                'name': 'Creative Commons Zero v1.0',
                'key': 'cc0-1.0',
                'category': 'Public Domain',
                'risk': 'LOW',
                'description': 'Public domain. No rights reserved. Use freely.',
                'icon': '🟢',
                'can_commercial': True,
                'can_modify': True,
                'can_distribute': True,
                'requires_attribution': False,
                'requires_open_source': False,
                'permissions': ['Commercial use', 'Modification', 'Distribution', 'Private use'],
                'conditions': [],
                'limitations': ['No liability', 'No warranty']
            },
            'proprietary': {
                'name': 'Proprietary License',
                'key': 'proprietary',
                'category': 'Commercial',
                'risk': 'HIGH',
                'description': 'Custom/Proprietary license. Read terms carefully. Contact owner for permissions.',
                'icon': '🔴',
                'can_commercial': 'Unknown',
                'can_modify': 'Unknown',
                'can_distribute': 'Unknown',
                'requires_attribution': 'Unknown',
                'requires_open_source': False,
                'permissions': [],
                'conditions': ['Review terms carefully'],
                'limitations': ['No liability', 'No warranty', 'Restrictions may apply']
            },
            'custom': {
                'name': 'Custom License',
                'key': 'custom',
                'category': 'Custom',
                'risk': 'MEDIUM',
                'description': 'Custom license found. Read the license terms carefully.',
                'icon': '🟡',
                'can_commercial': 'Unknown',
                'can_modify': 'Unknown',
                'can_distribute': 'Unknown',
                'requires_attribution': 'Unknown',
                'requires_open_source': False,
                'permissions': [],
                'conditions': ['Review terms carefully'],
                'limitations': ['No liability', 'No warranty']
            },
            'no-license': {
                'name': 'No License Found',
                'key': 'no-license',
                'category': 'Unknown',
                'risk': 'MEDIUM',
                'description': 'No license file found. By default, no permissions are granted. Consider adding a license.',
                'icon': '⚠️',
                'can_commercial': False,
                'can_modify': False,
                'can_distribute': False,
                'requires_attribution': False,
                'requires_open_source': False,
                'permissions': [],
                'conditions': ['Add a license to grant permissions'],
                'limitations': ['No commercial use', 'No modification', 'No distribution']
            },
            'unknown': {
                'name': 'Unknown License',
                'key': 'unknown',
                'category': 'Unknown',
                'risk': 'MEDIUM',
                'description': 'Could not identify license. Check the repository manually.',
                'icon': '⚠️',
                'can_commercial': 'Unknown',
                'can_modify': 'Unknown',
                'can_distribute': 'Unknown',
                'requires_attribution': 'Unknown',
                'requires_open_source': False,
                'permissions': [],
                'conditions': ['Manually review repository'],
                'limitations': ['No liability', 'No warranty']
            }
        }
        return licenses_db.get(key, licenses_db['unknown'])
    
    def _get_recommendation(self, license_key):
        """Professional recommendations based on license"""
        recommendations = {
            'MIT': 'Safe to use in commercial projects. Just include the original license and copyright notice.',
            'Apache-2.0': 'Safe for commercial use. Include license text and state any changes made.',
            'BSD-3-Clause': 'Very permissive for commercial use. Include copyright notice and disclaimer.',
            'BSD-2-Clause': 'Very permissive. Just include copyright notice.',
            'ISC': 'Similar to MIT. Safe for commercial use.',
            'GPL-3.0': '⚠️ If you distribute your software, you must share source code under GPL-3.0.',
            'GPL-2.0': '⚠️ Distribution requires open source. Not compatible with GPL-3.0.',
            'AGPL-3.0': 'Even web/SaaS usage requires open source. High legal risk for companies.',
            'LGPL-3.0': '⚠️ Safe as library. Changes to library must be open source.',
            'MPL-2.0': '⚠️ Modified files must be open source. Other files can stay closed.',
            'proprietary': 'Read terms carefully. Contact owner for commercial use permission.',
            'custom': '⚠️ Review the license terms. Legally review before commercial use.',
            'no-license': '⚠️ Add a license! Without license, default copyright laws apply.',
            'unknown': '⚠️ Manually review the repository license.'
        }
        return recommendations.get(license_key, 'Review license terms before use.')
